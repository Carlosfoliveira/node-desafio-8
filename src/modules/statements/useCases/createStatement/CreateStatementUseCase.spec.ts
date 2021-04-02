import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { CreateStatementError } from "./CreateStatementError";

import { OperationType } from '@modules/statements/entities/Statement';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;

describe('Create Statement', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('Should be able to create a new statement', async () => {
    const user = await createUserUseCase.execute({
      name: 'Carlos Test',
      email: 'carlos@test.com.br',
      password: '123456'
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Deposit Test'
    });

    expect(statement).toHaveProperty('id');
  });

  it('Should not be able to create a new statement to a non-existent user', () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: 'user123',
        type: OperationType.DEPOSIT,
        amount: 100,
        description: 'Deposit Test'
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it('Should not be able to create a new statement if has insufficient funds', () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: 'Carlos Test',
        email: 'carlos@test.com.br',
        password: '123456'
      });

      await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.WITHDRAW,
        amount: 100,
        description: 'Insufficient Funds Test'
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
