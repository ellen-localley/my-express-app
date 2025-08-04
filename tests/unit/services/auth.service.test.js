const bcrypt = require('bcryptjs');
const authService = require('../../../src/services/auth.service');
const User = require('../../../src/models/user.model');
const { userOne } = require('../../fixtures/user.fixture');

jest.mock('../../../src/models/user.model');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const mockUser = {
        _id: 'newUserId',
        email: userOne.email,
        name: userOne.name,
        role: 'user',
        save: jest.fn().mockResolvedValue(true),
        toSafeObject: jest.fn().mockReturnValue({
          _id: 'newUserId',
          email: userOne.email,
          name: userOne.name,
          role: 'user'
        })
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);

      const result = await authService.register({
        email: userOne.email,
        password: userOne.password,
        name: userOne.name
      });

      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(User.findOne).toHaveBeenCalledWith({ email: userOne.email });
    });

    it('should throw error if email already exists', async () => {
      User.findOne.mockResolvedValue({ email: userOne.email });

      await expect(authService.register({
        email: userOne.email,
        password: userOne.password,
        name: userOne.name
      })).rejects.toThrow('Email already exists');
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash(userOne.password, 10);
      const mockUser = {
        _id: userOne._id,
        email: userOne.email,
        password: hashedPassword,
        role: 'user',
        isActive: true,
        save: jest.fn().mockResolvedValue(true),
        toSafeObject: jest.fn().mockReturnValue({
          _id: userOne._id,
          email: userOne.email,
          role: 'user'
        })
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const result = await authService.login({
        email: userOne.email,
        password: userOne.password
      });

      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should throw error with invalid credentials', async () => {
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await expect(authService.login({
        email: userOne.email,
        password: 'wrongpassword'
      })).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if user is inactive', async () => {
      const mockUser = {
        _id: userOne._id,
        email: userOne.email,
        password: await bcrypt.hash(userOne.password, 10),
        isActive: false
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await expect(authService.login({
        email: userOne.email,
        password: userOne.password
      })).rejects.toThrow('Account is deactivated');
    });
  });
});