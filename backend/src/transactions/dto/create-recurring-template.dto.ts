import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType, RecurrenceFrequency } from '../../common/enums/transaction.enum';

export class CreateRecurringTemplateDto {
  @ApiProperty({ description: 'Nome do template' })
  @IsString()
  nome: string;

  @ApiProperty({ description: 'Título da transação' })
  @IsString()
  titulo: string;

  @ApiProperty({ description: 'Descrição da transação', required: false })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ description: 'Valor da transação', minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  valor: number;

  @ApiProperty({ enum: TransactionType, description: 'Tipo da transação' })
  @IsEnum(TransactionType)
  tipo: TransactionType;

  @ApiProperty({ enum: RecurrenceFrequency, description: 'Frequência de recorrência' })
  @IsEnum(RecurrenceFrequency)
  frequencia: RecurrenceFrequency;

  @ApiProperty({ description: 'Data de início' })
  @IsDateString()
  dataInicio: Date;

  @ApiProperty({ description: 'Data de fim', required: false })
  @IsOptional()
  @IsDateString()
  dataFim?: Date;

  @ApiProperty({ description: 'ID da conta' })
  @IsString()
  accountId: string;

  @ApiProperty({ description: 'ID da categoria', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;
}