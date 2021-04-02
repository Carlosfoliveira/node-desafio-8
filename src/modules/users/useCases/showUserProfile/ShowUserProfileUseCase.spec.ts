import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;

describe('Show User Profile', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('Should be able to show a user profile', async () => {
    const user = await createUserUseCase.execute({
      name: 'Carlos Test',
      email: 'carlos@test.com.br',
      password: '123456'
    });

    const profile = await showUserProfileUseCase.execute(user.id);

    expect(profile).toHaveProperty('id');
  });

  it('Should not be able to show non-existent user profile', () => {
    expect(async () => {
      await showUserProfileUseCase.execute('user-123');
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
