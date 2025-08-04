const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { generateTokens } = require('../../src/utils/jwt');

const userOne = {
  _id: new mongoose.Types.ObjectId(),
  email: 'user1@example.com',
  password: 'password123',
  name: 'User One',
  role: 'user',
  isActive: true
};

const userTwo = {
  _id: new mongoose.Types.ObjectId(),
  email: 'user2@example.com',
  password: 'password456',
  name: 'User Two',
  role: 'admin',
  isActive: true
};

const hashedUserOne = {
  ...userOne,
  password: bcrypt.hashSync(userOne.password, 10)
};

const hashedUserTwo = {
  ...userTwo,
  password: bcrypt.hashSync(userTwo.password, 10)
};

// 테스트용 토큰 생성
const userOneAccessToken = generateTokens({
  id: userOne._id,
  email: userOne.email,
  role: userOne.role
}).accessToken;

const userTwoAccessToken = generateTokens({
  id: userTwo._id,
  email: userTwo.email,
  role: userTwo.role
}).accessToken;

module.exports = {
  userOne,
  userTwo,
  hashedUserOne,
  hashedUserTwo,
  userOneAccessToken,
  userTwoAccessToken
};