import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { getStripe, createCheckoutSession } from '../services/stripeService';
import { calculateDistribution } from '../services/transactionService';
import { CreditService } from '../services/creditService';
import { ReferralService } from '../services/referralService';
import { sendMerchantOrderEmail, sendCustomerReceiptEmail } from '../services/emailService';
import { completeFundFromWebhook } from './walletController';



export const createCheckout = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { items, discountWaived, initiativeId, creditsToApply = 0 } = req.body;

  try {
    // 1. Fetch user and settings
    const neighbor = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { electedNonprofit: true }
    });

    if (!neighbor?.electedNonprofitId) {
      return res.status(400).json({ error: 'Please elect a nonprofit before checkout' });
    }

    const discountMode = neighbor.discountMode as 'PRICE_REDUCTION' | 'PLATFORM_CREDITS';

    // 2. Calculate total and distribution
    let totalGross = 0;
    const itemDetails = [];
    
    for (const item of items) {
      const ps = await prisma.productService.findUnique({
        where: { id: item.id },
        include: { merchant: true }
      });
      if (!ps) continue;
      totalGross += Number(ps.price) * item.quantity;
      itemDetails.push({ ps, quantity: item.quantity });
    }

    const nonprofit = await prisma.nonprofit.findUnique({
      where: { id: neighbor.electedNonprofitId }
    });

    if (!nonprofit?.stripeAccountId) {
      return res.status(400).json({ error: 'Selected nonprofit is not yet onboarded for payments' });
    }

    // We'll use the first merchant for simplicity in this demo checkout
    const merchant = itemDetails[0].ps.merchant;
    if (!merchant.stripeAccountId) {
      return res.status(400).json({ error: 'Merchant is not yet onboarded for payments' });
    }

    const distribution = calculateDistribution(
      totalGross,
      itemDetails.reduce((acc, item) => acc + (Number(item.ps.cogs) * item.quantity), 0),
      discountWaived,
      false, // Stripe checkout is not an internal transaction
      discountMode,
      creditsToApply
    );

    // 3. Create a pending transaction in our DB
    const transaction = await prisma.transaction.create({
      data: {
        neighborId: req.user.id,
        merchantId: merchant.id,
        productServiceId: itemDetails[0].ps.id,
        nonprofitId: nonprofit.id,
        grossAmount: totalGross,
        discountAmount: distribution.neighborDiscount,
        nonprofitShare: distribution.nonprofitShare,
        platformFee: distribution.platformFee,
        merchantNet: distribution.merchantNet,
        paymentMethod: 'CARD',
        discountWaived,
        waivedToInitiativeId: initiativeId,
        discountMode,
        appliedCredits: distribution.appliedCredits
      }
    });

    // 4. Create Stripe Checkout Session
    // The amount to pay is neighborPays
    const session = await createCheckoutSession({
      amount: Math.round(distribution.neighborPays.toNumber() * 100), // Stripe expects cents
      currency: 'usd',
      merchantAccountId: merchant.stripeAccountId,
      nonprofitAccountId: nonprofit.stripeAccountId,
      metadata: {
        transactionId: transaction.id,
        neighborId: req.user.id,
      },
      successUrl: `${process.env.APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.APP_URL}/checkout/cancel`,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const stripe = getStripe();
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret!);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Wallet top-up: card charged, credit wallet now
  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as any;
    if (pi.metadata?.purpose === 'wallet_topup') {
      await completeFundFromWebhook(pi.id);
    }
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const transactionId = session.metadata.transactionId;
    const bookingId = session.metadata.bookingId;

    if (bookingId) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'COMPLETED' }
      });
      console.log(`Booking ${bookingId} marked as COMPLETED via Stripe payment.`);
    }

    // Update transaction status or trigger payouts
    // In a real app, we'd use Stripe Transfers here to split the funds
    // For this demo, we'll just mark it as completed in our DB
    console.log(`Payment successful for transaction ${transactionId}`);

    // Handle Credits
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (transaction) {
      // 1. Redeem credits if applied
      if (Number(transaction.appliedCredits) > 0) {
        await CreditService.redeemCredits(transaction.neighborId, Number(transaction.appliedCredits), transaction.id);
      }

      // 2. Issue credits if in PLATFORM_CREDITS mode
      if (!transaction.discountWaived && transaction.discountMode === 'PLATFORM_CREDITS') {
        const isEligible = await CreditService.isSystemActivated();
        if (isEligible) {
          await CreditService.issueCredits(transaction.neighborId, Number(transaction.discountAmount), 'DISCOUNT', transaction.id);
        }
      }

      // 3. Handle Referral Bonuses
      await ReferralService.checkReferralBonuses(transaction.merchantId);

      // 4. Send email notifications
      try {
        const fullTx = await prisma.transaction.findUnique({
          where: { id: transaction.id },
          include: {
            neighbor: { select: { email: true, firstName: true } },
            merchant: { select: { businessName: true, user: { select: { email: true, firstName: true } } } },
            nonprofit: { select: { orgName: true } },
            productService: { select: { name: true } },
          },
        });
        if (fullTx) {
          const fulfillment = fullTx.paymentMethod === 'QR' ? 'In-Store QR Pay' : 'Online Payment';
          // Merchant notification
          await sendMerchantOrderEmail({
            merchantEmail: fullTx.merchant.user.email,
            merchantName: fullTx.merchant.user.firstName ?? fullTx.merchant.businessName,
            businessName: fullTx.merchant.businessName,
            customerFirstName: fullTx.neighbor.firstName ?? 'A customer',
            productName: fullTx.productService.name,
            quantity: 1,
            grossAmount: Number(fullTx.grossAmount),
            merchantNet: Number(fullTx.merchantNet),
            nonprofitShare: Number(fullTx.nonprofitShare),
            nonprofitName: fullTx.nonprofit.orgName,
            fulfillmentMethod: fulfillment,
            transactionId: fullTx.id,
          });
          // Customer receipt
          await sendCustomerReceiptEmail({
            customerEmail: fullTx.neighbor.email,
            customerFirstName: fullTx.neighbor.firstName ?? 'there',
            merchantName: fullTx.merchant.businessName,
            productName: fullTx.productService.name,
            quantity: 1,
            grossAmount: Number(fullTx.grossAmount),
            discountAmount: Number(fullTx.discountAmount),
            customerPaid: Number(fullTx.grossAmount) - Number(fullTx.discountAmount),
            nonprofitShare: Number(fullTx.nonprofitShare),
            nonprofitName: fullTx.nonprofit.orgName,
            platformFee: Number(fullTx.platformFee),
            transactionId: fullTx.id,
          });
        }
      } catch (emailErr) {
        console.error('[Payment] Email notification error:', emailErr);
      }
    }
  }

  res.json({ received: true });
};
