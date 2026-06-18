import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { FeatureFlagService, FeatureFlags } from '../services/featureFlagService';

/**
 * Gate a route behind a feature flag. Returns 403 when the flag is OFF.
 *
 * Used to keep money-transmitter-sensitive money movement disabled at launch:
 * custodial wallet top-up/withdraw (`enable_internal_banking`), peer-to-peer
 * credit transfers (`enable_credit_transfers`), and merchant netting execution
 * (`enable_netting_execution`). These stay OFF until a BaaS/Stripe-Connect phase
 * (see the MT-avoidance constraint). The flag is the real gate — not just a DB
 * threshold — so a route can never move funds while its flag is disabled.
 */
export const requireFlag = (flag: keyof FeatureFlags) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!FeatureFlagService.isEnabled(flag)) {
      return res.status(403).json({ error: 'This feature is currently disabled.', flag });
    }
    next();
  };
};
