import { Connection, createConnection } from "typeorm";
import request from 'supertest';
import { v4 as uuidV4 } from 'uuid';
import { app } from '../../../../app';
import { hash } from 'bcryptjs';

let connection: Connection;
describe('Authenticate User Controller', () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash('123456', 8);

    await connection.query(`
      INSERT INTO users(id, name, email, password, created_at, updated_at)
      VALUES('${id}', 'Carlos', 'carlos@test.com','${password}', now(), now());
    `);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('Should be able to create a user session', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'carlos@test.com',
      password: '123456',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('Should not be able to authenticate a non-existent user', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'wrongCarlos@test.com',
      password: '123456',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Incorrect email or password');
  });

  it('Should not be able to authenticate a user with wrong password', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'carlos@test.com',
      password: 'wrongPassword',
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Incorrect email or password');
  });
});
