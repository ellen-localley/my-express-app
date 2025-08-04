const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');
const AppError = require('../utils/appError');

const register = async ({ email, password, name }) => {
  // 이메일 중복 확인
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already exists', 409);
  }

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(password, 10);

  // 사용자 생성
  const user = await User.create({
    email,
    password: hashedPassword,
    name
  });

  // 토큰 생성
  const { accessToken, refreshToken } = generateTokens({
    id: user._id,
    email: user.email,
    role: user.role
  });

  // Refresh Token 저장
  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: user.toSafeObject(),
    accessToken,
    refreshToken
  };
};

const login = async ({ email, password }) => {
  // 사용자 확인
  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // 비밀번호 확인
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // 활성 사용자 확인
  if (!user.isActive) {
    throw new AppError('Account is deactivated', 403);
  }

  // 토큰 생성
  const { accessToken, refreshToken } = generateTokens({
    id: user._id,
    email: user.email,
    role: user.role
  });

  // Refresh Token 및 마지막 로그인 시간 업데이트
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  return {
    user: user.toSafeObject(),
    accessToken,
    refreshToken
  };
};

const refreshToken = async (token) => {
  try {
    // 토큰 검증
    const decoded = verifyRefreshToken(token);
    
    // 사용자 및 저장된 토큰 확인
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      throw new AppError('Invalid refresh token', 401);
    }

    // 새 Access Token 생성
    const { accessToken } = generateTokens({
      id: user._id,
      email: user.email,
      role: user.role
    });

    return { accessToken };
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
};

const logout = async (refreshToken) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    
    // Refresh Token 제거
    await User.findByIdAndUpdate(decoded.id, {
      $unset: { refreshToken: 1 }
    });
  } catch (error) {
    // 토큰이 유효하지 않아도 로그아웃은 성공으로 처리
  }
};

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  return user.toSafeObject();
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile
};
