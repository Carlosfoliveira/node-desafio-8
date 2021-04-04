import { Connection, createConnection } from "typeorm";
import request from 'supertest';
import { app } from '../../../../app';
import { User } from "@modules/users/entities/User";

let connection: Connection;
let user: User;
let token: string;
describe('Get Balance Controller', () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/api/v1/users').send({
      name: 'Carlos',
      email: 'carlos@test.com',
      password: '123456',
    });

    const responseSession = await request(app).post('/api/v1/sessions').send({
      email: 'carlos@test.com',
      password: '123456',
    });

    user = responseSession.body.user;
    token = responseSession.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to get a user balance equals to zero if has no statements', async () => {
    const response = await request(app).get('/api/v1/statements/balance').set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(200);
    expect(response.body.statement.length).toBe(0);
    expect(response.body.balance).toBe(0);
  });

  it('Should be able to get a user balance', async () => {
    await request(app).post('/api/v1/statements/deposit')
    .send({
      amount: 100,
      description: 'Deposit Test',
    })
    .set({
      Authorization: `Bearer ${token}`,
    });

    await request(app).post('/api/v1/statements/withdraw')
    .send({
      amount: 75,
      description: 'Withdraw Test',
    })
    .set({
      Authorization: `Bearer ${token}`,
    });

    const response = await request(app).get('/api/v1/statements/balance').set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(200);
    expect(response.body.statement.length).toBe(2);
    expect(response.body.balance).toBe(25);
  });

  it('Should not be able to get a user balance with missing JWT token', async () => {
    const response = await request(app).get('/api/v1/profile');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('JWT token is missing!');
  });

  it('Should not be able to get a user balance with invalid JWT token', async () => {
    const response = await request(app).get('/api/v1/profile').set({
      Authorization: 'Bearer 123452352452',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('JWT invalid token!');
  });

  it('Should not be able to get a user balance if user does not exists', async () => {
    await connection.query(`
      DELETE FROM public.users
      WHERE email='carlos@test.com';
    `);

    const response = await request(app).get('/api/v1/profile').set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});
