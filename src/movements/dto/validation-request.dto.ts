import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MovementDto {
  @ApiProperty({
    description: 'Identifiant unique du mouvement',
    example: 1,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Date du mouvement au format ISO (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'Libellé du mouvement',
    example: 'SALARY PAYMENT',
  })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    description:
      'Montant du mouvement (positif pour crédit, négatif pour débit)',
    example: 3000.0,
  })
  @IsNumber()
  amount: number;
}

export class BalanceDto {
  @ApiProperty({
    description: 'Date du point de contrôle au format ISO (YYYY-MM-DD)',
    example: '2024-01-31',
  })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    description: 'Solde au point de contrôle',
    example: 1929.5,
  })
  @IsNumber()
  balance: number;
}

export class ValidationRequestDto {
  @ApiProperty({
    description: 'Liste des mouvements bancaires à valider',
    type: [MovementDto],
    example: [
      {
        id: 1,
        date: '2024-01-05',
        label: 'SALARY PAYMENT',
        amount: 3000.0,
      },
      {
        id: 2,
        date: '2024-01-10',
        label: 'RENT PAYMENT',
        amount: -800.0,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MovementDto)
  movements: MovementDto[];

  @ApiProperty({
    description: 'Liste des points de contrôle (soldes)',
    type: [BalanceDto],
    example: [
      {
        date: '2024-01-31',
        balance: 1929.5,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BalanceDto)
  balances: BalanceDto[];
}
