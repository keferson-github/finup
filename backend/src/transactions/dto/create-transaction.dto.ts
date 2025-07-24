import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, IsArray, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType, TransactionStatus, RecurrenceFrequency } from '../../common/enums/transaction.enum';

export class CreateTransactionDto {
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

  @ApiProperty({ enum: TransactionStatus, description: 'Status da transação', required: false })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiProperty({ description: 'Data da transação' })
  @IsDateString()
  data: Date;

  @ApiProperty({ description: 'Data de vencimento', required: false })
  @IsOptional()
  @IsDateString()
  dataVencimento?: Date;

  @ApiProperty({ description: 'ID da conta' })
  @IsString()
  accountId: string;

  @ApiProperty({ description: 'ID da categoria', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  // Parcelamento
  @ApiProperty({ description: 'É parcelamento?', required: false })
  @IsOptional()
  @IsBoolean()
  ehParcelamento?: boolean;

  @ApiProperty({ description: 'Total de parcelas', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  totalParcelas?: number;

  // Recorrência
  @ApiProperty({ description: 'É recorrente?', required: false })
  @IsOptional()
  @IsBoolean()
  ehRecorrente?: boolean;

  @ApiProperty({ enum: RecurrenceFrequency, description: 'Frequência de recorrência', required: false })
  @IsOptional()
  @IsEnum(RecurrenceFrequency)
  frequenciaRecorrencia?: RecurrenceFrequency;

  @ApiProperty({ description: 'Data fim da recorrência', required: false })
  @IsOptional()
  @IsDateString()
  dataFimRecorrencia?: Date;

  // Metadados
  @ApiProperty({ description: 'Tags da transação', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: 'Observações', required: false })
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiProperty({ description: 'URL do anexo', required: false })
  @IsOptional()
  @IsString()
  urlAnexo?: string;
}