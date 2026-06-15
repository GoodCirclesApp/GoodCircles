import jwt from 'jsonwebtoken';
import { requireSecret } from './secrets';

const JWT_SECRET = requireSecret('JWT_SECRET', 'default_secret');
// Refresh tokens fall back to JWT_SECRET if JWT_REFRESH_SECRET is unset, so only
// JWT_SECRET must be confirmed present in the production host. requireSecret still
// fails fast in production if neither is set.
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET
  ? requireSecret('JWT_REFRESH_SECRET', 'default_refresh_secret')
  : JWT_SECRET;

export const generateTokens = (user: { id: string; role: string }) => {
  const accessToken = jwt.sign(
    { sub: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { sub: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};
