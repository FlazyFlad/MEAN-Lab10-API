const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../app');
const { sendTelegramMessage } = require('../telegram');
const User = require('../models/user');
//
describe('POST /login', () => {
  it('should authenticate user with correct credentials', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({ email: 'john@gmail.com', password: '123456' });

    expect(res.statusCode).to.equal(200);
    expect(res.body).to.have.property('accessToken');
    expect(res.body).to.have.property('refreshToken');
    sendTelegramMessage('511790458', 'Express First test passed successfully!');
  }).timeout(10000);

  it('should return 401 with incorrect credentials', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(res.statusCode).to.equal(401);
    expect(res.body).to.have.property('message', 'Пользователь не найден');
    sendTelegramMessage('511790458', 'Express Second test passed successfully!');
  });

  it('should return 401 with incorrect password', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({ email: 'john@gmail.com', password: 'wrongpassword' });

    expect(res.statusCode).to.equal(401);
    expect(res.body).to.have.property('message', 'Пароль не верный');
    sendTelegramMessage('511790458', 'Express Third test passed successfully!');
  });

  it('should return 400 with possible sql injection', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({ email: 'user2@gmail.com', password: '$select * from$' });

    expect(res.statusCode).to.equal(400);
    expect(res.body).to.have.property('message', 'В пароле содержится опасные символы (возможная SQL-инъекция)');
    sendTelegramMessage('511790458', 'Express Fourth test passed successfully!');
  });
});
