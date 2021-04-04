import { Connection, createConnection } from "typeorm";
import request from 'supertest';
import { app } from '../../../../app';

let connection: Connection;
describe('Create User Controller', () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able  to create a new user', async () => {
    const response = await request(app).post('/api/v1/users').send({
      name: 'Carlos',
      email: 'carlos@test.com',
      password: '123456',
    });

    expect(response.status).toBe(201);
  });

  it('Should not be able to create a new user when email already exists', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'Carlos',
      email: 'carlos@test.com',
      password: '123456',
    });

    const response = await request(app).post('/api/v1/users').send({
      name: 'Carlos Again',
      email: 'carlos@test.com',
      password: '654321',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User already exists');
  });
});
