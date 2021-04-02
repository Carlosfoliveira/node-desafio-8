import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceError } from "./GetBalanceError";

import { OperationType } from '@modules/statements/entities/Statement';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;

describe('Get balance', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('Should get balance for an user', async () => {
    const user = await createUserUseCase.execute({
      name: 'Carlos Test',
      email: 'carlos@test.com.br',
      password: '123456'
    });

    await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'Deposit Test'
    });

    await createStatementUseCase.execute({
      user_id: user.id,
      type: OperationType.WITHDRAW,
      amount: 25,
      description: 'Withdraw Test'
    });

    const balance = await getBalanceUseCase.execute({
      user_id: user.id
    });

    expect(balance.statement.length).toBe(2);
    expect(balance.balance).toBe(75);
  });

  it('Should not be able to get balance from a non-existent user', () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: 'user123'
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
