import { describe, it, expect, vi, beforeEach } from 'vitest';

// In-memory stand-in for the DB so we can exercise handleDeliveryEvent without Postgres.
const state: { recipient: any; campaign: any; suppressions: any[]; unsubs: any[] } = {
  recipient: null, campaign: null, suppressions: [], unsubs: [],
};

vi.mock('../lib/prisma', () => ({
  prisma: {
    emailRecipient: {
      findFirst: vi.fn(async ({ where }: any) =>
        state.recipient && state.recipient.resendId === where.resendId ? state.recipient : null),
      update: vi.fn(async ({ data }: any) => { Object.assign(state.recipient, data); return state.recipient; }),
    },
    emailCampaign: {
      update: vi.fn(async ({ data }: any) => {
        for (const k of Object.keys(data)) {
          if (data[k] && typeof data[k] === 'object' && 'increment' in data[k]) {
            state.campaign[k] = (state.campaign[k] || 0) + data[k].increment;
          } else { state.campaign[k] = data[k]; }
        }
        return state.campaign;
      }),
    },
    emailSuppression: { upsert: vi.fn(async ({ create }: any) => { state.suppressions.push(create); }) },
    emailUnsubscribe: { upsert: vi.fn(async ({ create }: any) => { state.unsubs.push(create); }) },
  },
}));

import { handleDeliveryEvent } from '../services/emailCampaignService';

const RID = 'msg-abc-123';

describe('Email delivery webhook handler', () => {
  beforeEach(() => {
    state.recipient = { id: 'r1', campaignId: 'c1', emailAddress: 'x@y.com', resendId: RID, status: 'SENT',
      deliveredAt: null, openedAt: null, clickedAt: null, bouncedAt: null, complainedAt: null };
    state.campaign = { id: 'c1', deliveredCount: 0, openedCount: 0, clickedCount: 0, bouncedCount: 0, complainedCount: 0 };
    state.suppressions = []; state.unsubs = [];
  });

  it('processes delivered → opened → clicked', async () => {
    await handleDeliveryEvent({ type: 'email.delivered', data: { email_id: RID } });
    await handleDeliveryEvent({ type: 'email.opened',    data: { email_id: RID } });
    await handleDeliveryEvent({ type: 'email.clicked',   data: { email_id: RID } });
    expect(state.campaign.deliveredCount).toBe(1);
    expect(state.campaign.openedCount).toBe(1);
    expect(state.campaign.clickedCount).toBe(1);
    expect(state.recipient.status).toBe('CLICKED');
  });

  it('records an open even if delivered arrives afterward (no status regression)', async () => {
    await handleDeliveryEvent({ type: 'email.opened', data: { email_id: RID } });
    expect(state.recipient.status).toBe('OPENED');
    expect(state.campaign.openedCount).toBe(1);
    await handleDeliveryEvent({ type: 'email.delivered', data: { email_id: RID } });
    expect(state.recipient.status).toBe('OPENED');      // did not regress to DELIVERED
    expect(state.campaign.deliveredCount).toBe(1);
  });

  it('counts a bounce and adds suppression', async () => {
    await handleDeliveryEvent({ type: 'email.bounced', data: { email_id: RID } });
    expect(state.campaign.bouncedCount).toBe(1);
    expect(state.recipient.status).toBe('BOUNCED');
    expect(state.suppressions[0]).toMatchObject({ emailAddress: 'x@y.com', reason: 'HARD_BOUNCE' });
  });

  it('counts a complaint and adds suppression + unsubscribe', async () => {
    await handleDeliveryEvent({ type: 'email.complained', data: { email_id: RID } });
    expect(state.campaign.complainedCount).toBe(1);
    expect(state.suppressions[0]).toMatchObject({ reason: 'COMPLAINED' });
    expect(state.unsubs[0]).toMatchObject({ emailAddress: 'x@y.com' });
  });

  it('is idempotent on a duplicate opened event', async () => {
    await handleDeliveryEvent({ type: 'email.opened', data: { email_id: RID } });
    await handleDeliveryEvent({ type: 'email.opened', data: { email_id: RID } });
    expect(state.campaign.openedCount).toBe(1);
  });

  it('accepts data.id when email_id is absent', async () => {
    await handleDeliveryEvent({ type: 'email.delivered', data: { id: RID } });
    expect(state.campaign.deliveredCount).toBe(1);
  });

  it('ignores an event whose id matches no recipient', async () => {
    await handleDeliveryEvent({ type: 'email.opened', data: { email_id: 'no-such-id' } });
    expect(state.campaign.openedCount).toBe(0);
  });
});
