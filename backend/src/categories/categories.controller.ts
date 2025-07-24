import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { TransactionType } from '../common/enums/transaction.enum';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  create(@Request() req, @Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(req.user.userId, createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user categories' })
  @ApiQuery({ name: 'tipo', enum: TransactionType, required: false })
  findAll(@Request() req, @Query('tipo') tipo?: TransactionType) {
    return this.categoriesService.findAll(req.user.userId, tipo);
  }

  @Get('income')
  @ApiOperation({ summary: 'Get income categories' })
  getIncomeCategories(@Request() req) {
    return this.categoriesService.getIncomeCategories(req.user.userId);
  }

  @Get('expense')
  @ApiOperation({ summary: 'Get expense categories' })
  getExpenseCategories(@Request() req) {
    return this.categoriesService.getExpenseCategories(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.categoriesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update category' })
  update(@Param('id') id: string, @Request() req, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, req.user.userId, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete category' })
  remove(@Param('id') id: string, @Request() req) {
    return this.categoriesService.remove(id, req.user.userId);
  }
}