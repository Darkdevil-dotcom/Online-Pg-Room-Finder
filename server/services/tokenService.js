const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const getJwtConfig = () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET,
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  refreshCookieName: process.env.REFRESH_COOKIE_NAME || 'refreshToken'
});

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const generateAccessToken = (user) => {
  const cfg = getJwtConfig();
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    cfg.accessSecret,
    { expiresIn: cfg.accessExpiresIn }
  );
};

const generateRefreshToken = (user) => {
  const cfg = getJwtConfig();
  return jwt.sign({ sub: user._id.toString() }, cfg.refreshSecret, { expiresIn: cfg.refreshExpiresIn });
};

const setRefreshTokenCookie = (res, token) => {
  const cfg = getJwtConfig();
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie(cfg.refreshCookieName, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth'
  });
};

const clearRefreshTokenCookie = (res) => {
  const cfg = getJwtConfig();
  const isProd = process.env.NODE_ENV === 'production';

  res.clearCookie(cfg.refreshCookieName, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/api/auth'
  });
};

const verifyRefreshToken = (token) => {
  const cfg = getJwtConfig();
  return jwt.verify(token, cfg.refreshSecret);
};

module.exports = {
  getJwtConfig,
  hashToken,
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  verifyRefreshToken
};
