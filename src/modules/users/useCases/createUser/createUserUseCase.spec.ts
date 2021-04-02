import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { CreateUserError } from "./CreateUserError";

let inMemoryUsersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase;

describe('Create User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('Should be able to create a new user', async () => {
    const user = await createUserUseCase.execute({
      name: 'Carlos Test',
      email: 'carlos@test.com.br',
      password: '123456'
    });

    expect(user).toHaveProperty('id');
  });

  it('Should not be able to create a new user when email already exists', () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: 'Dani Test',
        email: 'dani@test.com.br',
        password: '123456'
      });

      await createUserUseCase.execute({
        name: 'Dani Test Again',
        email: 'dani@test.com.br',
        password: '123456'
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
