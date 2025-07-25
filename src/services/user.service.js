const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

const getAllUsers = async () => {
  return await User.find().select('-password');
};

const getUserById = async (id) => {
  return await User.findById(id).select('-password');
};

const createUser = async (userData) => {
  const { email, password, name } = userData;
  
  // 이메일 중복 확인
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email already exists');
  }

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // 사용자 생성
  const user = new User({
    email,
    password: hashedPassword,
    name
  });
  
  await user.save();
  
  // 비밀번호 제외하고 반환
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser
};