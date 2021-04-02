import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError';

let inMemoryUsersRepository: InMemoryUsersRepository
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe('Authenticate User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('Should be able to authenticate an user', async () => {
    const user = {
      name: 'Carlos Test',
      email: 'carlos@test.com.br',
      password: '123456'
    }

    await createUserUseCase.execute(user);

    const authenticate = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    expect(authenticate).toHaveProperty('token');
  });

  it('Should not be able to authenticate a non-existent user', () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'non-existent@test.com.br',
        password: '123456'
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it('Should not be able to authenticate a user with wrong password', () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: 'Dani Test',
        email: 'dani@test.com.br',
        password: '123456'
      });

      await authenticateUserUseCase.execute({
        email: 'dani@test.com.br',
        password: 'wrongPassword'
      });

    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
