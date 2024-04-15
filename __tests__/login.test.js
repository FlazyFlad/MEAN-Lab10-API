const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../app');
const User = require('../models/user');

describe('POST /login', () => {


  it('should return 401 with incorrect credentials', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(res.statusCode).to.equal(401);
    expect(res.body).to.have.property('message', 'Пользователь не найден');
  });


  it('should return 400 with possible sql injection', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({ email: 'user2@gmail.com', password: '$select * from$' });

    expect(res.statusCode).to.equal(400);
    expect(res.body).to.have.property('message', 'В пароле содержится опасные символы (возможная SQL-инъекция)');
  });
});
