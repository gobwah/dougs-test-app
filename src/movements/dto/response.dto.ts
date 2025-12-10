import { ApiProperty } from '@nestjs/swagger';

export enum ValidationReasonType {
  BALANCE_MISMATCH = 'BALANCE_MISMATCH',
  DUPLICATE_TRANSACTION = 'DUPLICATE_TRANSACTION',
  MISSING_TRANSACTION = 'MISSING_TRANSACTION',
  INVALID_DATE_ORDER = 'INVALID_DATE_ORDER',
}

export class ValidationReasonDetailsDto {
  @ApiProperty({
    required: false,
    description: 'Date du point de contrôle concerné',
  })
  balanceDate?: string;

  @ApiProperty({ required: false, description: 'Solde attendu' })
  expectedBalance?: number;

  @ApiProperty({ required: false, description: 'Solde réel' })
  actualBalance?: number;

  @ApiProperty({
    required: false,
    description: 'Différence entre solde attendu et réel',
  })
  difference?: number;

  @ApiProperty({
    required: false,
    description: 'Mouvements dupliqués détectés',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        date: { type: 'string' },
        amount: { type: 'number' },
        label: { type: 'string' },
        duplicateType: {
          type: 'string',
          enum: ['exact', 'similar'],
          description:
            "Type de doublon: 'exact' pour labels identiques, 'similar' pour labels similaires",
        },
      },
    },
  })
  duplicateMovements?: Array<{
    id: number;
    date: string;
    amount: number;
    label: string;
    duplicateType: 'exact' | 'similar';
  }>;

  @ApiProperty({ required: false, description: 'Montant manquant' })
  missingAmount?: number;

  @ApiProperty({
    required: false,
    description: 'Début de la période concernée',
  })
  periodStart?: string;

  @ApiProperty({ required: false, description: 'Fin de la période concernée' })
  periodEnd?: string;
}

export class ValidationReasonDto {
  @ApiProperty({
    enum: ValidationReasonType,
    description: 'Type de raison de validation',
    example: ValidationReasonType.BALANCE_MISMATCH,
  })
  type: ValidationReasonType;

  @ApiProperty({
    description: 'Message descriptif de la raison',
    example: 'Balance mismatch at control point 2024-01-31T00:00:00.000Z',
  })
  message: string;

  @ApiProperty({
    description: 'Détails spécifiques à la raison',
    type: ValidationReasonDetailsDto,
  })
  details: ValidationReasonDetailsDto;
}

export class ValidationSuccessResponse {
  @ApiProperty({
    description: 'Message de succès',
    example: 'Accepted',
  })
  message: string = 'Accepted';
}

export class ValidationFailureResponse {
  @ApiProperty({
    description: "Message d'échec",
    example: 'Validation failed',
  })
  message: string = 'Validation failed';

  @ApiProperty({
    description: "Liste des raisons de l'échec de validation",
    type: [ValidationReasonDto],
  })
  reasons: ValidationReasonDto[];
}

// Keep interface for backward compatibility
export interface ValidationReason {
  type: ValidationReasonType;
  message: string;
  details: ValidationReasonDetailsDto;
}
