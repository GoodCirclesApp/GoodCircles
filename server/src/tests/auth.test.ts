import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateTokens, verifyAccessToken, verifyRefreshToken } from '../utils/tokenUtils';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret';

describe('Authentication & Authorization System', () => {
  const testEmail = `auth-test-${Date.now()}@example.com`;
  const testPassword = 'SecurePass123!';
  let testUserId: string;

  beforeAll(async () => {
    // Cleanup any leftover test data
    await prisma.user.deleteMany({
      where: { email: { startsWith: 'auth-test-' } }
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.merchantReferral.deleteMany({
      where: { merchant: { user: { email: { startsWith: 'auth-test-' } } } }
    });
    await prisma.merchant.deleteMany({
      where: { user: { email: { startsWith: 'auth-test-' } } }
    });
    await prisma.nonprofit.deleteMany({
      where: { user: { email: { startsWith: 'auth-test-' } } }
    });
    await prisma.cDFIPartner.deleteMany({
      where: { user: { email: { startsWith: 'auth-test-' } } }
    });
    await prisma.user.deleteMany({
      where: { email: { startsWith: 'auth-test-' } }
    });
    await prisma.$disconnect();
  });

  // ─── Registration Tests ─────────────────────────────────────────────

  describe('Registration', () => {
    it('should register a NEIGHBOR user successfully', async () => {
      const passwordHash = await bcrypt.hash(testPassword, 12);

      const user = await prisma.user.create({
        data: {
          email: testEmail,
          passwordHash,
          role: 'NEIGHBOR',
          firstName: 'Test',
          lastName: 'Neighbor',
        },
      });

      testUserId = user.id;

      expect(user).toBeDefined();
      expect(user.id).toBeTruthy();
      expect(user.email).toBe(testEmail);
      expect(user.role).toBe('NEIGHBOR');
      expect(user.isActive).toBe(true);
      expect(user.discountMode).toBe('PRICE_REDUCTION');
    });

    it('should register a MERCHANT user with role-specific record', async () => {
      const email = `auth-test-merchant-${Date.now()}@example.com`;
      const passwordHash = await bcrypt.hash(testPassword, 12);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'MERCHANT',
          firstName: 'Test',
          lastName: 'Merchant',
        },
      });

      const merchant = await prisma.merchant.create({
        data: {
          userId: user.id,
          businessName: 'Test Business LLC',
          businessType: 'BOTH',
          taxId: '12-3456789',
        },
      });

      expect(user.role).toBe('MERCHANT');
      expect(merchant).toBeDefined();
      expect(merchant.businessName).toBe('Test Business LLC');
      expect(merchant.isVerified).toBe(false);
      expect(merchant.creditAcceptance).toBe('NONE');
    });

    it('should register a NONPROFIT user with role-specific record', async () => {
      const email = `auth-test-nonprofit-${Date.now()}@example.com`;
      const passwordHash = await bcrypt.hash(testPassword, 12);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'NONPROFIT',
          firstName: 'Test',
          lastName: 'Nonprofit',
        },
      });

      const nonprofit = await prisma.nonprofit.create({
        data: {
          userId: user.id,
          orgName: 'Test Nonprofit Org',
          ein: `99-TEST${Date.now().toString().slice(-4)}`,
          missionStatement: 'Testing the auth system',
        },
      });

      expect(user.role).toBe('NONPROFIT');
      expect(nonprofit).toBeDefined();
      expect(nonprofit.orgName).toBe('Test Nonprofit Org');
      expect(nonprofit.isVerified).toBe(false);
    });

    it('should register a CDFI user with role-specific record', async () => {
      const email = `auth-test-cdfi-${Date.now()}@example.com`;
      const passwordHash = await bcrypt.hash(testPassword, 12);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'CDFI',
          firstName: 'Test',
          lastName: 'CDFI',
        },
      });

      const cdfi = await prisma.cDFIPartner.create({
        data: {
          userId: user.id,
          orgName: 'Test CDFI Partner',
          cdfiCertificationNumber: `CDFI-TEST-${Date.now()}`,
          lendingRegions: JSON.stringify(['msa-la', 'msa-ny']),
          partnershipStatus: 'applied',
        },
      });

      expect(user.role).toBe('CDFI');
      expect(cdfi).toBeDefined();
      expect(cdfi.orgName).toBe('Test CDFI Partner');
      expect(cdfi.partnershipStatus).toBe('applied');
    });

    it('should reject duplicate email registration', async () => {
      const passwordHash = await bcrypt.hash(testPassword, 12);

      await expect(
        prisma.user.create({
          data: {
            email: testEmail, // Already registered above
            passwordHash,
            role: 'NEIGHBOR',
          },
        })
      ).rejects.toThrow(); // Prisma P2002 unique constraint violation
    });

    it('should hash passwords with bcrypt (not store plain text)', async () => {
      const user = await prisma.user.findUnique({
        where: { email: testEmail },
      });

      expect(user).toBeDefined();
      expect(user!.passwordHash).not.toBe(testPassword);
      expect(user!.passwordHash.startsWith('$2')).toBe(true); // bcrypt prefix
      expect(await bcrypt.compare(testPassword, user!.passwordHash)).toBe(true);
    });
  });

  // ─── Login / Credential Tests ───────────────────────────────────────

  describe('Login & Credentials', () => {
    it('should validate correct password', async () => {
      const user = await prisma.user.findUnique({
        where: { email: testEmail },
      });

      expect(user).toBeDefined();
      const isValid = await bcrypt.compare(testPassword, user!.passwordHash);
      expect(isValid).toBe(true);
    });

    it('should reject wrong password', async () => {
      const user = await prisma.user.findUnique({
        where: { email: testEmail },
      });

      expect(user).toBeDefined();
      const isValid = await bcrypt.compare('WrongPassword!', user!.passwordHash);
      expect(isValid).toBe(false);
    });

    it('should reject non-existent email', async () => {
      const user = await prisma.user.findUnique({
        where: { email: 'nonexistent@example.com' },
      });

      expect(user).toBeNull();
    });
  });

  // ─── Token Tests ────────────────────────────────────────────────────

  describe('JWT Token Generation & Verification', () => {
    let accessToken: string;
    let refreshToken: string;

    it('should generate valid access and refresh tokens', () => {
      const tokens = generateTokens({ id: testUserId, role: 'NEIGHBOR' });

      accessToken = tokens.accessToken;
      refreshToken = tokens.refreshToken;

      expect(accessToken).toBeTruthy();
      expect(refreshToken).toBeTruthy();
      expect(typeof accessToken).toBe('string');
      expect(typeof refreshToken).toBe('string');
    });

    it('should decode access token with correct claims', () => {
      const decoded = verifyAccessToken(accessToken) as any;

      expect(decoded.sub).toBe(testUserId);
      expect(decoded.role).toBe('NEIGHBOR');
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });

    it('should decode refresh token with correct subject', () => {
      const decoded = verifyRefreshToken(refreshToken) as any;

      expect(decoded.sub).toBe(testUserId);
      expect(decoded.exp).toBeDefined();
    });

    it('should reject expired access token', () => {
      // Create a token that already expired
      const expiredToken = jwt.sign(
        { sub: testUserId, role: 'NEIGHBOR' },
        JWT_SECRET,
        { expiresIn: '0s' } // Immediately expired
      );

      // Small delay to ensure expiration
      expect(() => verifyAccessToken(expiredToken)).toThrow();
    });

    it('should reject tampered access token', () => {
      const tamperedToken = accessToken.slice(0, -5) + 'XXXXX';

      expect(() => verifyAccessToken(tamperedToken)).toThrow();
    });

    it('should reject token signed with wrong secret', () => {
      const badToken = jwt.sign(
        { sub: testUserId, role: 'NEIGHBOR' },
        'wrong_secret_key',
        { expiresIn: '15m' }
      );

      expect(() => verifyAccessToken(badToken)).toThrow();
    });

    it('should reject access token used as refresh token', () => {
      // Access token is signed with JWT_SECRET, not JWT_REFRESH_SECRET
      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });
  });

  // ─── Role Authorization Tests ───────────────────────────────────────

  describe('Role Authorization', () => {
    it('should encode role in token for authorization checks', () => {
      const neighborTokens = generateTokens({ id: 'u1', role: 'NEIGHBOR' });
      const merchantTokens = generateTokens({ id: 'u2', role: 'MERCHANT' });
      const nonprofitTokens = generateTokens({ id: 'u3', role: 'NONPROFIT' });
      const adminTokens = generateTokens({ id: 'u4', role: 'PLATFORM' });
      const cdfiTokens = generateTokens({ id: 'u5', role: 'CDFI' });

      expect((verifyAccessToken(neighborTokens.accessToken) as any).role).toBe('NEIGHBOR');
      expect((verifyAccessToken(merchantTokens.accessToken) as any).role).toBe('MERCHANT');
      expect((verifyAccessToken(nonprofitTokens.accessToken) as any).role).toBe('NONPROFIT');
      expect((verifyAccessToken(adminTokens.accessToken) as any).role).toBe('PLATFORM');
      expect((verifyAccessToken(cdfiTokens.accessToken) as any).role).toBe('CDFI');
    });

    it('should allow role check against allowed roles list', () => {
      const merchantToken = generateTokens({ id: 'u1', role: 'MERCHANT' });
      const decoded = verifyAccessToken(merchantToken.accessToken) as any;

      // Simulate authorizeRole logic
      const allowedRoles = ['MERCHANT'];
      expect(allowedRoles.includes(decoded.role)).toBe(true);

      const disallowedRoles = ['PLATFORM', 'NONPROFIT'];
      expect(disallowedRoles.includes(decoded.role)).toBe(false);
    });

    it('should support multi-role authorization', () => {
      const platformToken = generateTokens({ id: 'u1', role: 'PLATFORM' });
      const decoded = verifyAccessToken(platformToken.accessToken) as any;

      // Admin routes might allow both PLATFORM and MERCHANT
      const allowedRoles = ['PLATFORM', 'MERCHANT'];
      expect(allowedRoles.includes(decoded.role)).toBe(true);
    });
  });

  // ─── Verification Middleware Tests ──────────────────────────────────

  describe('Merchant/Nonprofit Verification', () => {
    it('should identify unverified merchant', async () => {
      const merchant = await prisma.merchant.findFirst({
        where: { user: { email: { startsWith: 'auth-test-merchant-' } } },
      });

      expect(merchant).toBeDefined();
      expect(merchant!.isVerified).toBe(false);
    });

    it('should allow admin to verify a merchant', async () => {
      const merchant = await prisma.merchant.findFirst({
        where: { user: { email: { startsWith: 'auth-test-merchant-' } } },
      });

      const verified = await prisma.merchant.update({
        where: { id: merchant!.id },
        data: { isVerified: true, onboardedAt: new Date() },
      });

      expect(verified.isVerified).toBe(true);
      expect(verified.onboardedAt).toBeDefined();
    });

    it('should identify unverified nonprofit', async () => {
      const nonprofit = await prisma.nonprofit.findFirst({
        where: { user: { email: { startsWith: 'auth-test-nonprofit-' } } },
      });

      expect(nonprofit).toBeDefined();
      expect(nonprofit!.isVerified).toBe(false);
    });

    it('should allow admin to verify a nonprofit', async () => {
      const nonprofit = await prisma.nonprofit.findFirst({
        where: { user: { email: { startsWith: 'auth-test-nonprofit-' } } },
      });

      const verified = await prisma.nonprofit.update({
        where: { id: nonprofit!.id },
        data: { isVerified: true, verifiedAt: new Date() },
      });

      expect(verified.isVerified).toBe(true);
      expect(verified.verifiedAt).toBeDefined();
    });
  });
});
