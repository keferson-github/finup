import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { RecurringTemplate } from './entities/recurring-template.entity';
import { Transaction } from './entities/transaction.entity';
import { CreateRecurringTemplateDto } from './dto/create-recurring-template.dto';
import { UpdateRecurringTemplateDto } from './dto/update-recurring-template.dto';
import { TransactionStatus, RecurrenceFrequency } from '../common/enums/transaction.enum';

@Injectable()
export class RecurringTemplatesService {
  constructor(
    @InjectRepository(RecurringTemplate)
    private templatesRepository: Repository<RecurringTemplate>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async create(userId: string, createTemplateDto: CreateRecurringTemplateDto): Promise<RecurringTemplate> {
    const template = this.templatesRepository.create({
      ...createTemplateDto,
      userId,
      proximaExecucao: createTemplateDto.dataInicio,
    });

    return this.templatesRepository.save(template);
  }

  async findAll(userId: string): Promise<RecurringTemplate[]> {
    return this.templatesRepository.find({
      where: { userId },
      relations: ['account', 'category'],
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<RecurringTemplate> {
    const template = await this.templatesRepository.findOne({
      where: { id, userId },
      relations: ['account', 'category'],
    });

    if (!template) {
      throw new NotFoundException('Template de recorrência não encontrado');
    }

    return template;
  }

  async update(id: string, userId: string, updateTemplateDto: UpdateRecurringTemplateDto): Promise<RecurringTemplate> {
    await this.findOne(id, userId); // Verify ownership
    await this.templatesRepository.update(id, updateTemplateDto);
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const template = await this.findOne(id, userId);
    await this.templatesRepository.remove(template);
  }

  async generateTransaction(id: string, userId: string): Promise<Transaction> {
    const template = await this.findOne(id, userId);

    if (!template.ativo || (template.dataFim && template.proximaExecucao > template.dataFim)) {
      throw new NotFoundException('Template inativo ou expirado');
    }

    // Create transaction
    const transaction = this.transactionsRepository.create({
      userId: template.userId,
      accountId: template.accountId,
      categoryId: template.categoryId,
      titulo: template.titulo,
      descricao: template.descricao,
      valor: template.valor,
      tipo: template.tipo,
      status: TransactionStatus.PENDENTE,
      data: template.proximaExecucao,
      ehRecorrente: true,
      frequenciaRecorrencia: template.frequencia,
      templateRecorrenciaId: template.id,
    });

    const savedTransaction = await this.transactionsRepository.save(transaction);

    // Update next execution date
    let nextExecution = new Date(template.proximaExecucao);

    switch (template.frequencia) {
      case RecurrenceFrequency.DIARIO:
        nextExecution = addDays(nextExecution, 1);
        break;
      case RecurrenceFrequency.SEMANAL:
        nextExecution = addWeeks(nextExecution, 1);
        break;
      case RecurrenceFrequency.MENSAL:
        nextExecution = addMonths(nextExecution, 1);
        break;
      case RecurrenceFrequency.ANUAL:
        nextExecution = addYears(nextExecution, 1);
        break;
    }

    await this.templatesRepository.update(id, { proximaExecucao: nextExecution });

    return savedTransaction;
  }

  async toggleActive(id: string, userId: string): Promise<RecurringTemplate> {
    const template = await this.findOne(id, userId);
    template.ativo = !template.ativo;
    return this.templatesRepository.save(template);
  }

  async getActiveTemplates(userId: string): Promise<RecurringTemplate[]> {
    return this.templatesRepository.find({
      where: { userId, ativo: true },
      relations: ['account', 'category'],
    });
  }

  async getUpcomingExecutions(userId: string): Promise<RecurringTemplate[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.templatesRepository
      .createQueryBuilder('template')
      .where('template.userId = :userId', { userId })
      .andWhere('template.ativo = :ativo', { ativo: true })
      .andWhere('template.proximaExecucao <= :today', { today })
      .getMany();
  }
}