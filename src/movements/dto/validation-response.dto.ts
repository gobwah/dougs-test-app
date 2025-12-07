export enum ValidationReasonType {
  BALANCE_MISMATCH = 'BALANCE_MISMATCH',
  DUPLICATE_TRANSACTION = 'DUPLICATE_TRANSACTION',
  MISSING_TRANSACTION = 'MISSING_TRANSACTION',
  INVALID_DATE_ORDER = 'INVALID_DATE_ORDER',
}

export interface ValidationReason {
  type: ValidationReasonType;
  message: string;
  details: {
    balanceDate?: string;
    expectedBalance?: number;
    actualBalance?: number;
    difference?: number;
    duplicateMovements?: Array<{
      id: number;
      date: string;
      amount: number;
      label: string;
    }>;
    missingAmount?: number;
    periodStart?: string;
    periodEnd?: string;
  };
}

export class ValidationSuccessResponse {
  message: string = 'Accepted';
}

export class ValidationFailureResponse {
  message: string = 'Validation failed';
  reasons: ValidationReason[];
}
