require('../setup');
const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/user.model');
const { 
  userOne, 
  userTwo, 
  hashedUserOne, 
  hashedUserTwo,
  userOneAccessToken,
  userTwoAccessToken 
} = require('../fixtures/user.fixture');

describe('User Endpoints', () => {
  beforeEach(async () => {
    await User.create([hashedUserOne, hashedUserTwo]);
  });

  describe('GET /api/users', () => {
    it('should get all users with authentication', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userOneAccessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].password).toBeUndefined();
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.totalItems).toBe(2);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .get('/api/users');

      expect(res.statusCode).toBe(401);
    });

    it('should filter users by search query', async () => {
      const res = await request(app)
        .get('/api/users?search=User One')
        .set('Authorization', `Bearer ${userOneAccessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('User One');
    });

    it('should filter users by role', async () => {
      const res = await request(app)
        .get('/api/users?role=admin')
        .set('Authorization', `Bearer ${userOneAccessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].role).toBe('admin');
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/users?page=1&limit=1')
        .set('Authorization', `Bearer ${userOneAccessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination.currentPage).toBe(1);
      expect(res.body.pagination.hasNext).toBe(true);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by id', async () => {
      const res = await request(app)
        .get(`/api/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.email).toBe(userOne.email);
      expect(res.body.data.password).toBeUndefined();
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439999';
      const res = await request(app)
        .get(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain('not found');
    });

    it('should return 400 for invalid id format', async () => {
      const res = await request(app)
        .get('/api/users/invalidid')
        .set('Authorization', `Bearer ${userOneAccessToken}`);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update own profile', async () => {
      const res = await request(app)
        .put(`/api/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({
          name: 'Updated Name'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
    });

    it('should return 403 when updating other user profile as non-admin', async () => {
      const res = await request(app)
        .put(`/api/users/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send({
          name: 'Hacker Name'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('only update your own profile');
    });

    it('admin should update any user profile', async () => {
      const res = await request(app)
        .put(`/api/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send({
          name: 'Admin Updated'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe('Admin Updated');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user with admin role', async () => {
      const res = await request(app)
        .delete(`/api/users/${userOne._id}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('deleted successfully');

      const user = await User.findById(userOne._id);
      expect(user).toBeNull();
    });

    it('should return 403 for non-admin user', async () => {
      const res = await request(app)
        .delete(`/api/users/${userTwo._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('insufficient permissions');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439999';
      const res = await request(app)
        .delete(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${userTwoAccessToken}`);

      expect(res.statusCode).toBe(404);
    });
  });
});