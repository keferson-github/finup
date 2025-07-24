import { IsString, IsEnum, IsOptional, IsHexColor } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../common/enums/transaction.enum';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Nome da categoria' })
  @IsString()
  nome: string;

  @ApiProperty({ enum: TransactionType, description: 'Tipo da categoria' })
  @IsEnum(TransactionType)
  tipo: TransactionType;

  @ApiProperty({ description: 'Cor da categoria em hexadecimal', required: false })
  @IsOptional()
  @IsHexColor()
  cor?: string;

  @ApiProperty({ description: 'Ícone da categoria', required: false })
  @IsOptional()
  @IsString()
  icone?: string;

  @ApiProperty({ description: 'Descrição da categoria', required: false })
  @IsOptional()
  @IsString()
  descricao?: string;
}