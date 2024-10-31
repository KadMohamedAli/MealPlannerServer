const createServer = require('../utils/server');
const request = require('supertest');
const { User, RefreshToken } = require('../models');
const bcrypt = require('bcrypt');

const app = createServer();
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3';
const clientIp = '192.168.0.100';

describe('Auth Controller', () => {
  let testUser;
  let accessToken;
  let refreshToken;
  const agent = request.agent(app);  // Using agent to keep cookies between requests

  beforeAll(async () => {
    const password = await bcrypt.hash('password123', 10);
    testUser = await User.create({ username: 'testuser', password, name: 'Test User', email: 'testuser@example.com' });
  });

  afterAll(async () => {
    await RefreshToken.destroy({ where: { user_id: testUser.id } });
    await User.destroy({ where: { id: testUser.id } });
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .set('User-Agent', userAgent)
        .set('X-Forwarded-For', clientIp)
        .send({
          username: 'newuser',
          password: 'newpassword123',
          name: 'New User',
          email: 'newuser@example.com',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.username).toBe('newuser');

      // Clean up new user
      await User.destroy({ where: { username: 'newuser' } });
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully and set refreshToken cookie as httpOnly', async () => {
      const response = await agent
        .post('/auth/login')
        .set('User-Agent', userAgent)
        .set('X-Forwarded-For', clientIp)
        .send({
          username: 'testuser',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged in successfully.');
      expect(response.headers['authorization']).toMatch(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/);

      const setCookieHeader = response.headers['set-cookie'];
      expect(setCookieHeader).toBeDefined();
      refreshToken = setCookieHeader
        .filter(cookie => cookie.startsWith('refreshToken='))
        .map(cookie => cookie.split(';')[0].split('=')[1]) // Extract only the token part
      accessToken = response.headers['authorization'].split(' ')[1];
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/auth/login')
        .set('User-Agent', userAgent)
        .set('X-Forwarded-For', clientIp)
        .send({
          username: 'nonexistentuser',
          password: 'password123',
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });

    it('should return 400 for incorrect password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .set('User-Agent', userAgent)
        .set('X-Forwarded-For', clientIp)
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid password');
    });
  });

  describe('POST /auth/refresh-token', () => {
    it('should refresh the access token using httpOnly refreshToken cookie', async () => {
      const theRefreshToken = 'refreshToken='+refreshToken;
      const theAccessToken = 'Bearer '+accessToken;
      const response = await agent
        .post('/auth/refresh-token')
        .set('User-Agent', userAgent)
        .set('X-Forwarded-For', clientIp)
        .set('Cookie',theRefreshToken)
        .set('Authorization',theAccessToken);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Token refreshed successfully');
      expect(response.headers['authorization']).toMatch(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/);

      const setCookieHeader = response.headers['set-cookie'];
      expect(setCookieHeader).toBeDefined();
      refreshToken = setCookieHeader
        .filter(cookie => cookie.startsWith('refreshToken='))
        .map(cookie => cookie.split(';')[0].split('=')[1]) // Extract only the token part
      accessToken = response.headers['authorization'].split(' ')[1];
    });
  });


  describe('POST /auth/change-password', () => {

    it('should return 400 for incorrect current password', async () => {
      const theRefreshToken = 'refreshToken='+refreshToken;
      const theAccessToken = 'Bearer '+accessToken;
      const response = await request(app)
        .post('/auth/change-password')
        .set('Cookie',theRefreshToken)
        .set('Authorization',theAccessToken)
        .set('User-Agent', userAgent)
        .set('X-Forwarded-For', clientIp)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword789',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Current password is incorrect');
    });
    it('should change the password successfully', async () => {
          const theRefreshToken = 'refreshToken='+refreshToken;
          const theAccessToken = 'Bearer '+accessToken;
          const response = await request(app)
            .post('/auth/change-password')
            .set('Cookie',theRefreshToken)
            .set('Authorization',theAccessToken)
            .set('User-Agent', userAgent)
            .set('X-Forwarded-For', clientIp)
            .send({
              currentPassword: 'password123',
              newPassword: 'newpassword456',
            });

          expect(response.status).toBe(200);
          expect(response.body.message).toBe('Password changed successfully');

          console.log(response.headers);

          const setCookieHeader = response.headers['set-cookie'];
          expect(setCookieHeader).toBeDefined();
          refreshToken = setCookieHeader
            .filter(cookie => cookie.startsWith('refreshToken='))
            .map(cookie => cookie.split(';')[0].split('=')[1]) // Extract only the token part
          accessToken = response.headers['authorization'].split(' ')[1];
        });
  });
    

  describe('POST /auth/logout', () => {
    it('should logout the user and clear cookies', async () => {
      
      const theRefreshToken = 'refreshToken='+refreshToken[1];
      const theAccessToken = 'Bearer '+accessToken;
      const response = await agent
        .post('/auth/logout')
        .set('User-Agent', userAgent)
        .set('X-Forwarded-For', clientIp)
        .set('Cookie',theRefreshToken)
        .set('Authorization',theAccessToken);

        console.log(response.body);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');
    });
  });
});
