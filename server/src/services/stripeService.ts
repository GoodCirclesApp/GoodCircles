import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export const getStripe = (): Stripe => {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    stripeClient = new Stripe(key, {
      apiVersion: '2025-01-27.acacia' as any,
    });
  }
  return stripeClient;
};

export const createConnectAccount = async (email: string, type: 'merchant' | 'nonprofit') => {
  const stripe = getStripe();
  const account = await stripe.accounts.create({
    type: 'express',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: { type },
  });
  return account;
};

export const createAccountLink = async (accountId: string, returnUrl: string, refreshUrl: string) => {
  const stripe = getStripe();
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });
  return accountLink;
};

export const createCheckoutSession = async (params: {
  amount: number;
  currency: string;
  merchantAccountId: string;
  nonprofitAccountId: string;
  metadata: any;
  successUrl: string;
  cancelUrl: string;
}) => {
  const stripe = getStripe();
  
  // 10/10/1 logic:
  // Gross: 100%
  // Merchant: 79%
  // Nonprofit: 10%
  // Platform: 11% (1% fee + 10% discount/waiver)
  
  const merchantAmount = Math.round(params.amount * 0.79);
  const nonprofitAmount = Math.round(params.amount * 0.10);

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: params.currency,
          product_data: {
            name: 'Good Circles Transaction',
          },
          unit_amount: params.amount,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      transfer_group: params.metadata.transactionId,
    },
    metadata: params.metadata,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });

  return session;
};
