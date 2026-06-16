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

  // NOTE: the destination split (merchant/nonprofit/platform) is computed authoritatively
  // in transactionService.calculateDistribution and recorded on the ledger. This Checkout
  // session charges the full neighbor amount with a transfer_group; Connect destination
  // transfers are wired at the disbursement (Stripe Connect) phase. Do NOT re-derive the
  // split here. (Removed the dead legacy 79/10/11 computation that contradicted the ledger.)
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
