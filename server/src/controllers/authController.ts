import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { generateTokens, verifyRefreshToken } from '../utils/tokenUtils';
import { AuthRequest } from '../middleware/authMiddleware';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['NEIGHBOR', 'MERCHANT', 'NONPROFIT', 'CDFI']),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  // Merchant specific
  businessName: z.string().optional(),
  businessType: z.enum(['GOODS', 'SERVICES', 'BOTH']).optional(),
  taxId: z.string().optional(),
  // Nonprofit specific
  orgName: z.string().optional(),
  ein: z.string().optional(),
  missionStatement: z.string().optional(),
  referralCode: z.string().optional(),
  // CDFI specific
  cdfiOrgName: z.string().optional(),
  cdfiCertificationNumber: z.string().optional(),
  lendingRegions: z.array(z.string()).optional(),
});

export const register = async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(data.password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          role: data.role,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });

      if (data.role === 'MERCHANT') {
        if (!data.businessName || !data.businessType) {
          throw new Error('Business name and type are required for merchants');
        }
        const merchant = await tx.merchant.create({
          data: {
            userId: user.id,
            businessName: data.businessName,
            businessType: data.businessType,
            taxId: data.taxId,
          },
        });

        if (data.referralCode) {
          const nonprofit = await tx.nonprofit.findUnique({
            where: { referralCode: data.referralCode }
          });

          if (nonprofit) {
            await tx.merchantReferral.create({
              data: {
                referringNonprofitId: nonprofit.id,
                merchantId: merchant.id,
                referralCodeUsed: data.referralCode
              }
            });
          }
        }
      } else if (data.role === 'NONPROFIT') {
        if (!data.orgName || !data.ein) {
          throw new Error('Organization name and EIN are required for nonprofits');
        }
        await tx.nonprofit.create({
          data: {
            userId: user.id,
            orgName: data.orgName,
            ein: data.ein,
            missionStatement: data.missionStatement,
          },
        });
      } else if (data.role === 'CDFI') {
        if (!data.cdfiOrgName || !data.cdfiCertificationNumber) {
          throw new Error('CDFI organization name and certification number are required');
        }
        await tx.cDFIPartner.create({
          data: {
            userId: user.id,
            orgName: data.cdfiOrgName,
            cdfiCertificationNumber: data.cdfiCertificationNumber,
            lendingRegions: JSON.stringify(data.lendingRegions || []),
            partnershipStatus: 'applied',
          },
        });
      }

      return user;
    });

    // FIXED: Changed 'user' to 'result' in the lines below
    const tokens = generateTokens(result);
    res.json({ 
      user: { id: result.id, email: result.email, role: result.role }, 
      token: tokens.accessToken, 
      refreshToken: tokens.refreshToken 
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues });
    }
    if (err.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokens = generateTokens(user);
    res.json({ user: { id: user.id, email: user.email, role: user.role }, token: tokens.accessToken, refreshToken: tokens.refreshToken });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken) as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const tokens = generateTokens(user);
    res.json(tokens);
  } catch (err) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        wallet: true,
        merchant: true,
        nonprofit: true,
        electedNonprofit: true,
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  discountMode: z.enum(['PRICE_REDUCTION', 'PLATFORM_CREDITS']).optional(),
});

export const updateProfile = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const data = updateProfileSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      include: {
        wallet: true,
        merchant: true,
        nonprofit: true,
        electedNonprofit: true,
      }
    });
    
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  } catch (err: any) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    res.status(500).json({ error: err.message });
  }
};
