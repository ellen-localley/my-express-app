require('../setup');
const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/user.model');
const { userOne, hashedUserOne } = require('../fixtures/user.fixture');

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('newuser@example.com');
      expect(res.body.data.accessToken).toBeDefined();

      const user = await User.findOne({ email: 'newuser@example.com' });
      expect(user).toBeDefined();
      expect(user.name).toBe('New User');
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'New User'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should return 400 for short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          name: 'Test User'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors[0].msg).toContain('at least 6 characters');
    });

    it('should return 409 for duplicate email', async () => {
      await User.create(hashedUserOne);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: userOne.email,
          password: 'password123',
          name: 'Another User'
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create(hashedUserOne);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: userOne.email,
          password: userOne.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(userOne.email);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.headers['set-cookie'][0]).toContain('refreshToken');
    });

    it('should return 401 for invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: userOne.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('Invalid credentials');
    });

    it('should return 401 for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('Invalid credentials');
    });
  });

  describe('GET /api/auth/profile', () => {
    let authToken;

    beforeEach(async () => {
      await User.create(hashedUserOne);
      
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: userOne.email,
          password: userOne.password
        });
      
      authToken = loginRes.body.data.accessToken;
    });

    it('should get user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(userOne.email);
      expect(res.body.data.name).toBe(userOne.name);
      expect(res.body.data.password).toBeUndefined();
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/auth/profile');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('No token provided');
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('Invalid token');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken;

    beforeEach(async () => {
      await User.create(hashedUserOne);
      
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: userOne.email,
          password: userOne.password
        });
      
      // Extract refresh token from cookie
      const cookies = loginRes.headers['set-cookie'];
      refreshToken = cookies[0].split(';')[0].split('=')[1];
    });

    it('should refresh access token with valid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', `refreshToken=${refreshToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should return 401 without refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toContain('Refresh token not provided');
    });
  });
});