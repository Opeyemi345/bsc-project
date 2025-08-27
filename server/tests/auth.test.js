const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('Authentication Endpoints', () => {
  beforeEach(async () => {
    // Clean up test data before each test
    await User.deleteMany({});
  });

  describe('POST /users - User Registration', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        firstname: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        bio: 'Test user'
      };

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.username).toBe(userData.username);
    });

    it('should return error for missing required fields', async () => {
      const userData = {
        firstname: 'John',
        // Missing lastname, username, email, password
      };

      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        firstname: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123'
      };

      // Create first user
      await request(app)
        .post('/users')
        .send(userData)
        .expect(201);

      // Try to create second user with same email
      const duplicateUser = {
        ...userData,
        username: 'johndoe2'
      };

      const response = await request(app)
        .post('/users')
        .send(duplicateUser)
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/login - User Login', () => {
    beforeEach(async () => {
      // Create a test user
      const userData = {
        firstname: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        bio: 'Test user'
      };

      await request(app)
        .post('/users')
        .send(userData);
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        username: 'johndoe',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.username).toBe(loginData.username);
    });

    it('should login with email instead of username', async () => {
      const loginData = {
        username: 'john@example.com', // Using email as username
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        username: 'johndoe',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return error for non-existent user', async () => {
      const loginData = {
        username: 'nonexistent',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return error for missing credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Protected Routes', () => {
    let authToken;

    beforeEach(async () => {
      // Create and login a test user
      const userData = {
        firstname: 'John',
        lastname: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/users')
        .send(userData);

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          username: 'johndoe',
          password: 'password123'
        });

      authToken = loginResponse.body.data.token;
    });

    it('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should deny access to protected route without token', async () => {
      const response = await request(app)
        .get('/users')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should deny access to protected route with invalid token', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

module.exports = {
  // Export any test utilities if needed
};
