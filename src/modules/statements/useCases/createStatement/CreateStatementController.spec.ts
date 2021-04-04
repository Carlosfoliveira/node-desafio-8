import { Connection, createConnection } from "typeorm";
import request from 'supertest';
import { app } from '../../../../app';
import { User } from "@modules/users/entities/User";

let connection: Connection;
let user: User;
let token: string;
describe('Create Statement Controller', () => {

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

  it('Should be able to create a deposit statement', async () => {
    const response = await request(app).post('/api/v1/statements/deposit')
    .send({
      amount: 100,
      description: 'Deposit Test',
    })
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.user_id).toBe(user.id);
    expect(response.body.amount).toBe(100);
    expect(response.body.type).toBe('deposit');
  });

  it('Should be able to create a withdraw statement', async () => {
    const response = await request(app).post('/api/v1/statements/withdraw')
    .send({
      amount: 100,
      description: 'Withdraw Test',
    })
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.user_id).toBe(user.id);
    expect(response.body.amount).toBe(100);
    expect(response.body.type).toBe('withdraw');
  });

  it('Should not be able to create a withdraw statement if user have insufficient funds', async () => {
    const response = await request(app).post('/api/v1/statements/withdraw')
    .send({
      amount: 100,
      description: 'Withdraw Test',
    })
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Insufficient funds');
  });

  it('Should not be able to create a statement with missing JWT token', async () => {
    const response = await request(app).get('/api/v1/profile');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('JWT token is missing!');
  });

  it('Should not be able to create a statement with invalid JWT token', async () => {
    const response = await request(app).get('/api/v1/profile').set({
      Authorization: 'Bearer 123452352452',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('JWT invalid token!');
  });

  it('Should not be able to create a statement if user does not exists', async () => {
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
