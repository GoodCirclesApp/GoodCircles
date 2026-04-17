import { prisma } from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

const DEFAULT_PROPOSAL_DAYS = 14;
const DEFAULT_QUORUM = 10;

export class GovernanceService {
  // Ensure a global FiscalPolicy singleton exists
  static async getOrCreateGlobalPolicy() {
    let policy = await prisma.fiscalPolicy.findFirst({ where: { isGlobal: true } });
    if (!policy) {
      policy = await prisma.fiscalPolicy.create({
        data: { isGlobal: true, discountRate: 0.10, nonprofitRate: 0.10, platformRate: 0.01 },
      });
    }
    return policy;
  }

  static async getPolicy(regionId?: string) {
    if (regionId) {
      const regional = await prisma.fiscalPolicy.findUnique({ where: { regionId } });
      if (regional) return regional;
    }
    return this.getOrCreateGlobalPolicy();
  }

  static async createProposal(
    proposerId: string,
    policyId: string,
    title: string,
    description: string,
    proposedChanges: Record<string, unknown>,
    stakeAmount: number = 0
  ) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + DEFAULT_PROPOSAL_DAYS);

    return prisma.governanceProposal.create({
      data: {
        policyId,
        proposerId,
        title,
        description,
        proposedChanges: proposedChanges as any,
        stakeAmount: new Decimal(stakeAmount),
        quorum: DEFAULT_QUORUM,
        expiresAt,
      },
    });
  }

  static async castVoteByUser(proposalId: string, voterId: string, inFavor: boolean) {
    const proposal = await prisma.governanceProposal.findUnique({ where: { id: proposalId } });
    if (!proposal) throw new Error('Proposal not found');
    if (proposal.status !== 'OPEN') throw new Error('Proposal is not open for voting');
    if (new Date() > proposal.expiresAt) throw new Error('Proposal voting period has ended');

    // upsert is not ideal here but protects against double votes
    const existing = await prisma.proposalVote.findUnique({
      where: { proposalId_voterId: { proposalId, voterId } },
    });
    if (existing) throw new Error('You have already voted on this proposal');

    await prisma.proposalVote.create({ data: { proposalId, voterId, inFavor, voteWeight: 1 } });

    const updated = await prisma.governanceProposal.update({
      where: { id: proposalId },
      data: inFavor
        ? { votesFor: { increment: 1 } }
        : { votesAgainst: { increment: 1 } },
    });

    const totalVotes = updated.votesFor + updated.votesAgainst;
    if (totalVotes >= updated.quorum) {
      if (updated.votesFor > updated.votesAgainst) {
        await this.executeProposal(proposalId);
      } else {
        await prisma.governanceProposal.update({
          where: { id: proposalId },
          data: { status: 'REJECTED' },
        });
      }
    }

    return updated;
  }

  static async executeProposal(proposalId: string) {
    const proposal = await prisma.governanceProposal.findUnique({
      where: { id: proposalId },
      include: { policy: true },
    });
    if (!proposal) throw new Error('Proposal not found');

    const changes = proposal.proposedChanges as Record<string, unknown>;

    // Build policy update from proposed changes
    const policyUpdate: Record<string, unknown> = {};
    if (typeof changes.discountRate === 'number') policyUpdate.discountRate = changes.discountRate;
    if (typeof changes.nonprofitRate === 'number') policyUpdate.nonprofitRate = changes.nonprofitRate;
    if (typeof changes.platformRate === 'number') policyUpdate.platformRate = changes.platformRate;

    // Category overrides: merge with existing
    if (changes.category && typeof changes.category === 'string') {
      const existing = (proposal.policy.categoryOverrides as Record<string, unknown>) ?? {};
      existing[changes.category] = { ...((existing[changes.category] as object) ?? {}), ...changes };
      delete existing[changes.category as string];
      // Rebuild: spread the per-category keys from changes (excluding 'category')
      const { category, ...rateChanges } = changes;
      existing[category as string] = rateChanges;
      policyUpdate.categoryOverrides = existing;
    }

    await prisma.$transaction([
      prisma.fiscalPolicy.update({ where: { id: proposal.policyId }, data: policyUpdate }),
      prisma.governanceProposal.update({
        where: { id: proposalId },
        data: { status: 'PASSED', executedAt: new Date() },
      }),
    ]);
  }

  // Expire open proposals past their deadline (call from daily cron)
  static async expireStaleProposals() {
    return prisma.governanceProposal.updateMany({
      where: { status: 'OPEN', expiresAt: { lt: new Date() } },
      data: { status: 'EXPIRED' },
    });
  }

  static async getProposals(policyId?: string, status?: string) {
    return prisma.governanceProposal.findMany({
      where: {
        ...(policyId ? { policyId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        proposer: { select: { firstName: true, lastName: true, role: true } },
        _count: { select: { votes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
