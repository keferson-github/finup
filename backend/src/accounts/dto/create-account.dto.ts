import { IsString, IsEnum, IsNumber, IsOptional, IsHexColor, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '../../common/enums/transaction.enum';

export class CreateAccountDto {
  @ApiProperty({ description: 'Nome da conta' })
  @IsString()
  nome: string;

  @ApiProperty({ enum: AccountType, description: 'Tipo da conta' })
  @IsEnum(AccountType)
  tipo: AccountType;

  @ApiProperty({ description: 'Saldo inicial da conta', minimum: 0 })
  @IsNumber()
  @Min(0)
  saldoInicial: number;

  @ApiProperty({ description: 'Cor da conta em hexadecimal', required: false })
  @IsOptional()
  @IsHexColor()
  cor?: string;

  @ApiProperty({ description: 'Descrição da conta', required: false })
  @IsOptional()
  @IsString()
  descricao?: string;
}