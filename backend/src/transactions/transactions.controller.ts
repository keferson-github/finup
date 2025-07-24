import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionType, TransactionStatus } from '../common/enums/transaction.enum';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  create(@Request() req, @Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(req.user.userId, createTransactionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user transactions with filters' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'accountId', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'tipo', enum: TransactionType, required: false })
  @ApiQuery({ name: 'status', enum: TransactionStatus, required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('accountId') accountId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('tipo') tipo?: TransactionType,
    @Query('status') status?: TransactionStatus,
    @Query('search') search?: string,
  ) {
    return this.transactionsService.findAll(req.user.userId, {
      startDate,
      endDate,
      accountId,
      categoryId,
      tipo,
      status,
      search,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get transaction statistics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'accountId', required: false })
  getStats(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('accountId') accountId?: string,
  ) {
    return this.transactionsService.getStats(req.user.userId, {
      startDate,
      endDate,
      accountId,
    });
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue transactions' })
  getOverdueTransactions(@Request() req) {
    return this.transactionsService.getOverdueTransactions(req.user.userId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming transactions' })
  @ApiQuery({ name: 'days', required: false })
  getUpcomingTransactions(@Request() req, @Query('days') days?: number) {
    return this.transactionsService.getUpcomingTransactions(req.user.userId, days);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.transactionsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update transaction' })
  update(@Param('id') id: string, @Request() req, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionsService.update(id, req.user.userId, updateTransactionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete transaction' })
  remove(@Param('id') id: string, @Request() req) {
    return this.transactionsService.remove(id, req.user.userId);
  }

  @Post(':id/mark-paid')
  @ApiOperation({ summary: 'Mark transaction as paid' })
  markAsPaid(@Param('id') id: string, @Request() req) {
    return this.transactionsService.markAsPaid(id, req.user.userId);
  }

  @Post(':id/mark-pending')
  @ApiOperation({ summary: 'Mark transaction as pending' })
  markAsPending(@Param('id') id: string, @Request() req) {
    return this.transactionsService.markAsPending(id, req.user.userId);
  }
}