const jwt = require('jsonwebtoken');
const { generateTokens, verifyAccessToken, verifyRefreshToken } = require('../../../src/utils/jwt');

describe('JWT Utils', () => {
  const payload = { id: '123', email: 'test@example.com', role: 'user' };

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const { accessToken, refreshToken } = generateTokens(payload);

      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
      expect(typeof accessToken).toBe('string');
      expect(typeof refreshToken).toBe('string');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const { accessToken } = generateTokens(payload);
      const decoded = verifyAccessToken(accessToken);

      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyAccessToken('invalid-token');
      }).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const { refreshToken } = generateTokens(payload);
      const decoded = verifyRefreshToken(refreshToken);

      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
    });
  });
});