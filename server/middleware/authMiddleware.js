const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    throw new ApiError(401, 'Access token missing');
  }

  const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  const user = await User.findById(payload.sub).select('-password -refreshTokens');

  if (!user) {
    throw new ApiError(401, 'Invalid token user');
  }

  req.user = user;
  next();
});

const allowRoles = (...roles) => (req, res, next) => {
  const role = req.user?.role;
  const expanded = new Set(roles);
  if (roles.includes('tenant')) expanded.add('user');
  if (roles.includes('user')) expanded.add('tenant');

  if (!role || !expanded.has(role)) {
    return next(new ApiError(403, 'Insufficient permission'));
  }
  next();
};

module.exports = {
  protect,
  allowRoles
};
