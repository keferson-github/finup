import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionStatus, TransactionType, RecurrenceFrequency } from '../common/enums/transaction.enum';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private accountsService: AccountsService,
  ) {}

  async create(userId: string, createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const transaction = this.transactionsRepository.create({
      ...createTransactionDto,
      userId,
    });

    const savedTransaction = await this.transactionsRepository.save(transaction);

    // Update account balance if transaction is paid
    if (savedTransaction.status === TransactionStatus.PAGO) {
      await this.updateAccountBalance(savedTransaction, 'create');
    }

    // Create installments if needed
    if (savedTransaction.ehParcelamento && savedTransaction.totalParcelas > 1) {
      await this.createInstallments(savedTransaction);
    }

    // Create recurring transactions if needed
    if (savedTransaction.ehRecorrente && savedTransaction.frequenciaRecorrencia) {
      await this.createRecurringTransactions(savedTransaction);
    }

    return savedTransaction;
  }

  async findAll(
    userId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      accountId?: string;
      categoryId?: string;
      tipo?: TransactionType;
      status?: TransactionStatus;
      search?: string;
    },
  ): Promise<Transaction[]> {
    const query = this.transactionsRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.account', 'account')
      .leftJoinAndSelect('transaction.category', 'category')
      .where('transaction.userId = :userId', { userId })
      .orderBy('transaction.data', 'DESC')
      .addOrderBy('transaction.criadoEm', 'DESC');

    if (filters?.startDate) {
      query.andWhere('transaction.data >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('transaction.data <= :endDate', { endDate: filters.endDate });
    }

    if (filters?.accountId) {
      query.andWhere('transaction.accountId = :accountId', { accountId: filters.accountId });
    }

    if (filters?.categoryId) {
      query.andWhere('transaction.categoryId = :categoryId', { categoryId: filters.categoryId });
    }

    if (filters?.tipo) {
      query.andWhere('transaction.tipo = :tipo', { tipo: filters.tipo });
    }

    if (filters?.status) {
      query.andWhere('transaction.status = :status', { status: filters.status });
    }

    if (filters?.search) {
      query.andWhere(
        '(transaction.titulo ILIKE :search OR transaction.descricao ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    return query.getMany();
  }

  async findOne(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id, userId },
      relations: ['account', 'category'],
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    return transaction;
  }

  async update(id: string, userId: string, updateTransactionDto: UpdateTransactionDto): Promise<Transaction> {
    const oldTransaction = await this.findOne(id, userId);
    
    // Revert old balance impact if transaction was paid
    if (oldTransaction.status === TransactionStatus.PAGO) {
      await this.updateAccountBalance(oldTransaction, 'revert');
    }

    await this.transactionsRepository.update(id, updateTransactionDto);
    const updatedTransaction = await this.findOne(id, userId);

    // Apply new balance impact if transaction is paid
    if (updatedTransaction.status === TransactionStatus.PAGO) {
      await this.updateAccountBalance(updatedTransaction, 'create');
    }

    return updatedTransaction;
  }

  async remove(id: string, userId: string): Promise<void> {
    const transaction = await this.findOne(id, userId);

    // Revert balance impact if transaction was paid
    if (transaction.status === TransactionStatus.PAGO) {
      await this.updateAccountBalance(transaction, 'revert');
    }

    await this.transactionsRepository.remove(transaction);
  }

  async markAsPaid(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.findOne(id, userId);
    
    if (transaction.status !== TransactionStatus.PAGO) {
      transaction.status = TransactionStatus.PAGO;
      await this.transactionsRepository.save(transaction);
      await this.updateAccountBalance(transaction, 'create');
    }

    return transaction;
  }

  async markAsPending(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.findOne(id, userId);
    
    if (transaction.status === TransactionStatus.PAGO) {
      await this.updateAccountBalance(transaction, 'revert');
    }
    
    transaction.status = TransactionStatus.PENDENTE;
    await this.transactionsRepository.save(transaction);

    return transaction;
  }

  async getStats(
    userId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      accountId?: string;
    },
  ) {
    const query = this.transactionsRepository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId })
      .andWhere('transaction.status = :status', { status: TransactionStatus.PAGO });

    if (filters?.startDate) {
      query.andWhere('transaction.data >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('transaction.data <= :endDate', { endDate: filters.endDate });
    }

    if (filters?.accountId) {
      query.andWhere('transaction.accountId = :accountId', { accountId: filters.accountId });
    }

    const transactions = await query.getMany();

    const receitas = transactions
      .filter(t => t.tipo === TransactionType.RECEITA)
      .reduce((sum, t) => sum + Number(t.valor), 0);

    const despesas = transactions
      .filter(t => t.tipo === TransactionType.DESPESA)
      .reduce((sum, t) => sum + Number(t.valor), 0);

    return {
      receitas,
      despesas,
      saldoLiquido: receitas - despesas,
      totalTransacoes: transactions.length,
    };
  }

  async getOverdueTransactions(userId: string): Promise<Transaction[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update overdue transactions
    await this.transactionsRepository
      .createQueryBuilder()
      .update(Transaction)
      .set({ status: TransactionStatus.VENCIDO })
      .where('userId = :userId', { userId })
      .andWhere('status = :status', { status: TransactionStatus.PENDENTE })
      .andWhere('data < :today', { today })
      .execute();

    return this.transactionsRepository.find({
      where: {
        userId,
        status: TransactionStatus.VENCIDO,
      },
      relations: ['account', 'category'],
      order: { data: 'ASC' },
    });
  }

  async getUpcomingTransactions(userId: string, days: number = 7): Promise<Transaction[]> {
    const today = new Date();
    const futureDate = addDays(today, days);

    return this.transactionsRepository.find({
      where: {
        userId,
        status: TransactionStatus.PENDENTE,
        data: Between(today, futureDate),
      },
      relations: ['account', 'category'],
      order: { data: 'ASC' },
    });
  }

  private async updateAccountBalance(transaction: Transaction, operation: 'create' | 'revert'): Promise<void> {
    const amount = Number(transaction.valor);
    let balanceOperation: 'add' | 'subtract';

    if (operation === 'create') {
      balanceOperation = transaction.tipo === TransactionType.RECEITA ? 'add' : 'subtract';
    } else {
      balanceOperation = transaction.tipo === TransactionType.RECEITA ? 'subtract' : 'add';
    }

    await this.accountsService.updateBalance(transaction.accountId, amount, balanceOperation);
  }

  private async createInstallments(parentTransaction: Transaction): Promise<void> {
    const installments: Partial<Transaction>[] = [];
    const installmentValue = Number(parentTransaction.valor) / parentTransaction.totalParcelas;

    for (let i = 2; i <= parentTransaction.totalParcelas; i++) {
      const installmentDate = addMonths(new Date(parentTransaction.data), i - 1);
      
      installments.push({
        userId: parentTransaction.userId,
        accountId: parentTransaction.accountId,
        categoryId: parentTransaction.categoryId,
        titulo: `${parentTransaction.titulo} (${i}/${parentTransaction.totalParcelas})`,
        descricao: parentTransaction.descricao,
        valor: installmentValue,
        tipo: parentTransaction.tipo,
        status: TransactionStatus.PENDENTE,
        data: installmentDate,
        ehParcelamento: true,
        numeroParcela: i,
        totalParcelas: parentTransaction.totalParcelas,
        transacaoPaiId: parentTransaction.id,
        tags: parentTransaction.tags,
        observacoes: parentTransaction.observacoes,
      });
    }

    await this.transactionsRepository.save(installments);

    // Update parent transaction
    await this.transactionsRepository.update(parentTransaction.id, {
      titulo: `${parentTransaction.titulo} (1/${parentTransaction.totalParcelas})`,
      valor: installmentValue,
      numeroParcela: 1,
    });
  }

  private async createRecurringTransactions(parentTransaction: Transaction, monthsAhead: number = 12): Promise<void> {
    const recurringTransactions: Partial<Transaction>[] = [];
    let currentDate = new Date(parentTransaction.data);
    const endDate = parentTransaction.dataFimRecorrencia || addMonths(new Date(), monthsAhead);

    while (currentDate < endDate) {
      // Calculate next date based on frequency
      switch (parentTransaction.frequenciaRecorrencia) {
        case RecurrenceFrequency.DIARIO:
          currentDate = addDays(currentDate, 1);
          break;
        case RecurrenceFrequency.SEMANAL:
          currentDate = addWeeks(currentDate, 1);
          break;
        case RecurrenceFrequency.MENSAL:
          currentDate = addMonths(currentDate, 1);
          break;
        case RecurrenceFrequency.ANUAL:
          currentDate = addYears(currentDate, 1);
          break;
      }

      if (currentDate <= endDate) {
        recurringTransactions.push({
          userId: parentTransaction.userId,
          accountId: parentTransaction.accountId,
          categoryId: parentTransaction.categoryId,
          titulo: parentTransaction.titulo,
          descricao: parentTransaction.descricao,
          valor: parentTransaction.valor,
          tipo: parentTransaction.tipo,
          status: TransactionStatus.PENDENTE,
          data: new Date(currentDate),
          ehRecorrente: true,
          frequenciaRecorrencia: parentTransaction.frequenciaRecorrencia,
          dataFimRecorrencia: parentTransaction.dataFimRecorrencia,
          templateRecorrenciaId: parentTransaction.id,
          tags: parentTransaction.tags,
          observacoes: parentTransaction.observacoes,
        });
      }
    }

    if (recurringTransactions.length > 0) {
      await this.transactionsRepository.save(recurringTransactions);
    }
  }
}