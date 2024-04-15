const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../app');
const User = require('../models/user');

describe('POST /login', () => {
  it('should authenticate user with correct credentials', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({ email: 'john@gmail.com', password: '123456' });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('accessToken');
    expect(res.body).to.have.property('refreshToken');
  });

  it('should return 401 with incorrect credentials', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('message', 'User not found');
  });

  it('should return 401 with incorrect password', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({ email: 'john@gmail.com', password: 'wrongpassword' });

    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('message', 'Incorrect password');
  });

  it('should return 400 with possible SQL injection attempt', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({ email: 'user2@gmail.com', password: '$select * from$' });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Password contains dangerous characters (possible SQL injection)');
  });
});
