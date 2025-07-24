import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@ApiTags('Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  create(@Request() req, @Body() createAccountDto: CreateAccountDto) {
    return this.accountsService.create(req.user.userId, createAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user accounts' })
  findAll(@Request() req) {
    return this.accountsService.findAll(req.user.userId);
  }

  @Get('total-balance')
  @ApiOperation({ summary: 'Get total balance across all accounts' })
  getTotalBalance(@Request() req) {
    return this.accountsService.getTotalBalance(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.accountsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update account' })
  update(@Param('id') id: string, @Request() req, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountsService.update(id, req.user.userId, updateAccountDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete account' })
  remove(@Param('id') id: string, @Request() req) {
    return this.accountsService.remove(id, req.user.userId);
  }
}