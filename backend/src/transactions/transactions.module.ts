import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { RecurringTemplate } from './entities/recurring-template.entity';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { RecurringTemplatesService } from './recurring-templates.service';
import { RecurringTemplatesController } from './recurring-templates.controller';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, RecurringTemplate]),
    AccountsModule,
  ],
  controllers: [TransactionsController, RecurringTemplatesController],
  providers: [TransactionsService, RecurringTemplatesService],
  exports: [TransactionsService, RecurringTemplatesService],
})
export class TransactionsModule {}