import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { TransactionType } from '../common/enums/transaction.enum';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(userId: string, createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      userId,
    });
    return this.categoriesRepository.save(category);
  }

  async findAll(userId: string, tipo?: TransactionType): Promise<Category[]> {
    const where: any = { userId, ativo: true };
    if (tipo) {
      where.tipo = tipo;
    }

    return this.categoriesRepository.find({
      where,
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id, userId },
    });
    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }
    return category;
  }

  async update(id: string, userId: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    await this.findOne(id, userId); // Verify ownership
    await this.categoriesRepository.update(id, updateCategoryDto);
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const category = await this.findOne(id, userId);
    
    // Check if category has transactions
    const hasTransactions = await this.categoriesRepository
      .createQueryBuilder('category')
      .leftJoin('category.transactions', 'transaction')
      .where('category.id = :id', { id })
      .andWhere('transaction.id IS NOT NULL')
      .getCount();

    if (hasTransactions > 0) {
      // Soft delete - mark as inactive
      await this.categoriesRepository.update(id, { ativo: false });
    } else {
      // Hard delete if no transactions
      await this.categoriesRepository.remove(category);
    }
  }

  async getIncomeCategories(userId: string): Promise<Category[]> {
    return this.findAll(userId, TransactionType.RECEITA);
  }

  async getExpenseCategories(userId: string): Promise<Category[]> {
    return this.findAll(userId, TransactionType.DESPESA);
  }
}