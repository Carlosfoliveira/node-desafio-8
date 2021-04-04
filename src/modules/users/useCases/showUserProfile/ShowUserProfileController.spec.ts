import { Connection, createConnection } from "typeorm";
import request from 'supertest';
import { app } from '../../../../app';

let connection: Connection;
let token: string;
describe('Show User Controller', () => {

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

    token = responseSession.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to show a user profile', async () => {
    const response = await request(app).get('/api/v1/profile').set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });

  it('Should not be able to show a profile with missing JWT token', async () => {
    const response = await request(app).get('/api/v1/profile');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('JWT token is missing!');
  });

  it('Should not be able to show a profile with invalid JWT token', async () => {
    const response = await request(app).get('/api/v1/profile').set({
      Authorization: 'Bearer 123452352452',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('JWT invalid token!');
  });

  it('Should not be able to show a profile if user does not exists', async () => {
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
