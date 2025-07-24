import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) {}

  async create(userId: string, createAccountDto: CreateAccountDto): Promise<Account> {
    const account = this.accountsRepository.create({
      ...createAccountDto,
      userId,
      saldo: createAccountDto.saldoInicial || 0,
    });
    return this.accountsRepository.save(account);
  }

  async findAll(userId: string): Promise<Account[]> {
    return this.accountsRepository.find({
      where: { userId, ativo: true },
      order: { criadoEm: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Account> {
    const account = await this.accountsRepository.findOne({
      where: { id, userId },
    });
    if (!account) {
      throw new NotFoundException('Conta não encontrada');
    }
    return account;
  }

  async update(id: string, userId: string, updateAccountDto: UpdateAccountDto): Promise<Account> {
    await this.findOne(id, userId); // Verify ownership
    await this.accountsRepository.update(id, updateAccountDto);
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const account = await this.findOne(id, userId);
    
    // Check if account has transactions
    const hasTransactions = await this.accountsRepository
      .createQueryBuilder('account')
      .leftJoin('account.transactions', 'transaction')
      .where('account.id = :id', { id })
      .andWhere('transaction.id IS NOT NULL')
      .getCount();

    if (hasTransactions > 0) {
      // Soft delete - mark as inactive
      await this.accountsRepository.update(id, { ativo: false });
    } else {
      // Hard delete if no transactions
      await this.accountsRepository.remove(account);
    }
  }

  async updateBalance(accountId: string, amount: number, operation: 'add' | 'subtract' | 'set' = 'add'): Promise<number> {
    const account = await this.accountsRepository.findOne({ where: { id: accountId } });
    if (!account) {
      throw new NotFoundException('Conta não encontrada');
    }

    let newBalance = Number(account.saldo);
    
    switch (operation) {
      case 'add':
        newBalance += Number(amount);
        break;
      case 'subtract':
        newBalance -= Number(amount);
        break;
      case 'set':
        newBalance = Number(amount);
        break;
    }

    await this.accountsRepository.update(accountId, { saldo: newBalance });
    return newBalance;
  }

  async getTotalBalance(userId: string): Promise<number> {
    const result = await this.accountsRepository
      .createQueryBuilder('account')
      .select('SUM(account.saldo)', 'total')
      .where('account.userId = :userId', { userId })
      .andWhere('account.ativo = :ativo', { ativo: true })
      .getRawOne();

    return Number(result.total) || 0;
  }
}