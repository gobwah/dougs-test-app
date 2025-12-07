import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MovementDto {
  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsNumber()
  amount: number;
}

export class BalanceDto {
  @IsString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  balance: number;
}

export class ValidationRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MovementDto)
  movements: MovementDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BalanceDto)
  balances: BalanceDto[];
}
