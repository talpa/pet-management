import request from 'supertest';
import { sequelize } from '../src/config/database';
import { User } from '../src/models/User';

let app: any;

describe('Authentication & User Management', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    app = require('../src/server').default;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('User Registration', () => {
    beforeEach(async () => {
      await User.destroy({ where: {} });
    });

    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        status: 'active'
      });
      expect(response.body.user.password).toBeUndefined();
    });

    it('should hash the password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const user = await User.findOne({ where: { email: 'test@example.com' } });
      expect(user?.password).not.toBe('password123');
      expect(user?.password).toBeDefined();
    });

    it('should prevent duplicate email registration', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Second registration with same email
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
    });

    it('should validate required fields', async () => {
      const incompleteData = {
        name: 'Test User'
        // missing email and password
      };

      await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400);
    });

    it('should validate email format', async () => {
      const invalidData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
        role: 'user'
      };

      await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);
    });

    it('should validate password strength', async () => {
      const weakPasswordData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123', // too weak
        role: 'user'
      };

      await request(app)
        .post('/api/auth/register')
        .send(weakPasswordData)
        .expect(400);
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      await User.destroy({ where: {} });
      
      // Create test user
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: '$2b$10$encrypted_password_hash', // Mock bcrypt hash
        role: 'user',
        status: 'active'
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        email: 'test@example.com',
        role: 'user'
      });
      expect(response.body.user.password).toBeUndefined();
    });

    it('should reject invalid email', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
    });

    it('should reject invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
    });

    it('should reject inactive user', async () => {
      // Update user to inactive
      await User.update(
        { status: 'inactive' },
        { where: { email: 'test@example.com' } }
      );

      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
    });

    it('should update lastLoginAt on successful login', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      const user = await User.findOne({ where: { email: 'test@example.com' } });
      expect(user?.lastLoginAt).toBeDefined();
    });
  });

  describe('OAuth Authentication', () => {
    it('should handle Google OAuth callback', async () => {
      const googleData = {
        provider: 'google',
        providerId: 'google_123456',
        email: 'google@example.com',
        name: 'Google User',
        avatar: 'https://example.com/avatar.jpg'
      };

      const response = await request(app)
        .post('/api/auth/oauth/callback')
        .send(googleData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toMatchObject({
        email: 'google@example.com',
        provider: 'google',
        providerId: 'google_123456'
      });
    });

    it('should handle Facebook OAuth callback', async () => {
      const facebookData = {
        provider: 'facebook',
        providerId: 'facebook_123456',
        email: 'facebook@example.com',
        name: 'Facebook User'
      };

      const response = await request(app)
        .post('/api/auth/oauth/callback')
        .send(facebookData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user.provider).toBe('facebook');
    });

    it('should link OAuth account to existing user', async () => {
      // Create existing user
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
        role: 'user',
        status: 'active',
        provider: 'local'
      });

      const oauthData = {
        provider: 'google',
        providerId: 'google_123456',
        email: 'existing@example.com',
        name: 'Existing User'
      };

      const response = await request(app)
        .post('/api/auth/oauth/callback')
        .send(oauthData)
        .expect(200);

      const user = await User.findOne({ where: { email: 'existing@example.com' } });
      expect(user?.provider).toBe('google');
      expect(user?.providerId).toBe('google_123456');
    });
  });

  describe('Token Validation', () => {
    let validToken: string;
    let userId: number;

    beforeEach(async () => {
      await User.destroy({ where: {} });
      
      // Create user and get token
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      validToken = response.body.token;
      userId = response.body.user.id;
    });

    it('should validate valid JWT token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: userId,
        email: 'test@example.com',
        role: 'user'
      });
    });

    it('should reject request without token', async () => {
      await request(app)
        .get('/api/auth/me')
        .expect(401);
    });

    it('should reject invalid token', async () => {
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });

    it('should reject expired token', async () => {
      // This would require mocking JWT with expired token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDB9.invalid';
      
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });

  describe('Password Reset', () => {
    beforeEach(async () => {
      await User.destroy({ where: {} });
      
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: '$2b$10$encrypted_password_hash',
        role: 'user',
        status: 'active'
      });
    });

    it('should initiate password reset for valid email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body.message).toMatch(/reset link sent/i);
    });

    it('should not reveal if email does not exist', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.message).toMatch(/reset link sent/i);
    });

    it('should validate reset token and update password', async () => {
      // This would require implementing password reset token logic
      const resetData = {
        token: 'valid_reset_token',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(200);

      expect(response.body.message).toMatch(/password updated/i);
    });
  });

  describe('Role-Based Access Control', () => {
    let userToken: string;
    let adminToken: string;

    beforeEach(async () => {
      await User.destroy({ where: {} });
      
      // Create regular user
      const userResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Regular User',
          email: 'user@example.com',
          password: 'password123',
          role: 'user'
        });
      userToken = userResponse.body.token;

      // Create admin user
      const adminResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'password123',
          role: 'admin'
        });
      adminToken = adminResponse.body.token;
    });

    it('should allow admin access to admin routes', async () => {
      await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should deny user access to admin routes', async () => {
      await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should allow users to access their own data', async () => {
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });
  });
});