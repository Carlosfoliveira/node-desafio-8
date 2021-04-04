import { Connection, createConnection } from "typeorm";
import request from 'supertest';
import { app } from '../../../../app';
import { User } from "@modules/users/entities/User";
import { v4 as uuidV4 } from "uuid";

let connection: Connection;
let user: User;
let token: string;
describe('Get Statement Operation Controller', () => {

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

  it('Should be able to get a statement', async () => {
    const responseStatement = await request(app).post('/api/v1/statements/deposit').send({
        amount: 100,
        description: 'Deposit Test',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id } = responseStatement.body;

    const response = await request(app).get(`/api/v1/statements/${id}`).set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(id);
  });

  it('Should not be able to get a inexistent statement', async () => {
    const id = uuidV4();
    const response = await request(app).get(`/api/v1/statements/${id}`).set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Statement not found');
  });

  it('Should not be able to get a statement with missing JWT token', async () => {
    const response = await request(app).get('/api/v1/profile');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('JWT token is missing!');
  });

  it('Should not be able to get a statement with invalid JWT token', async () => {
    const response = await request(app).get('/api/v1/profile').set({
      Authorization: 'Bearer 123452352452',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('JWT invalid token!');
  });

  it('Should not be able to get a statement if user does not exists', async () => {
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
