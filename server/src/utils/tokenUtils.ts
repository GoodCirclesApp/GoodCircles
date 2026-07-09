import jwt from 'jsonwebtoken';
import { requireSecret } from './secrets';

const JWT_SECRET = requireSecret('JWT_SECRET', 'default_secret');
// Refresh tokens fall back to JWT_SECRET if JWT_REFRESH_SECRET is unset, so only
// JWT_SECRET must be confirmed present in the production host. requireSecret still
// fails fast in production if neither is set.
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET
  ? requireSecret('JWT_REFRESH_SECRET', 'default_refresh_secret')
  : JWT_SECRET;

// Pin HS256 on both sign and verify (compliance audit D3) to prevent algorithm-
// confusion attacks (e.g. a forged token asserting alg:none or an RS/HS swap).
export const generateTokens = (user: { id: string; role: string }) => {
  const accessToken = jwt.sign(
    { sub: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m', algorithm: 'HS256' }
  );

  const refreshToken = jwt.sign(
    { sub: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d', algorithm: 'HS256' }
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_REFRESH_SECRET, { algorithms: ['HS256'] });
};
