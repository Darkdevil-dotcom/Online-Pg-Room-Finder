const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const {
  hashToken,
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  verifyRefreshToken,
  getJwtConfig
} = require('../services/tokenService');

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

const issueTokens = async (user, res) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshTokens.push(hashToken(refreshToken));
  await user.save();
  setRefreshTokenCookie(res, refreshToken);
  return accessToken;
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'name, email, and password are required');
  }

  const normalizedRole = role === 'owner' ? 'owner' : 'user';
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    throw new ApiError(409, 'Email already registered');
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: normalizedRole
  });

  const accessToken = await issueTokens(user, res);

  res.status(201).json({
    success: true,
    message: 'Registered successfully',
    data: {
      user: publicUser(user),
      accessToken
    }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const accessToken = await issueTokens(user, res);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: publicUser(user),
      accessToken
    }
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshCookieName } = getJwtConfig();
  const token = req.cookies[refreshCookieName];

  if (!token) {
    throw new ApiError(401, 'Refresh token missing');
  }

  const payload = verifyRefreshToken(token);
  const user = await User.findById(payload.sub);

  if (!user) {
    throw new ApiError(401, 'Invalid refresh token user');
  }

  const incomingHash = hashToken(token);
  const tokenExists = user.refreshTokens.includes(incomingHash);

  if (!tokenExists) {
    throw new ApiError(401, 'Refresh token not recognized');
  }

  user.refreshTokens = user.refreshTokens.filter((tokenHash) => tokenHash !== incomingHash);

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  user.refreshTokens.push(hashToken(newRefreshToken));
  await user.save();

  setRefreshTokenCookie(res, newRefreshToken);

  res.json({
    success: true,
    message: 'Token refreshed',
    data: {
      accessToken: newAccessToken
    }
  });
});

const logout = asyncHandler(async (req, res) => {
  const { refreshCookieName } = getJwtConfig();
  const token = req.cookies[refreshCookieName];

  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      const user = await User.findById(payload.sub);
      if (user) {
        const incomingHash = hashToken(token);
        user.refreshTokens = user.refreshTokens.filter((tokenHash) => tokenHash !== incomingHash);
        await user.save();
      }
    } catch (error) {
      // Ignore token parsing issues during logout.
    }
  }

  clearRefreshTokenCookie(res);

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password -refreshTokens').populate({
    path: 'favorites',
    select: 'title price address roomType gender images'
  });

  res.json({
    success: true,
    data: user
  });
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  me
};
