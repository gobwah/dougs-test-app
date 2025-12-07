import { Test, TestingModule } from '@nestjs/testing';
import { MovementsService } from '../../src/movements/movements.service';
import { ValidationRequestDto } from '../../src/movements/dto/validation-request.dto';

describe('MovementsService', () => {
  let service: MovementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MovementsService],
    }).compile();

    service = module.get<MovementsService>(MovementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateMovements', () => {
    it('should accept valid movements and balances', () => {
      const request: ValidationRequestDto = {
        movements: [
          {
            id: 1,
            date: '2024-01-01',
            label: 'Transaction 1',
            amount: 100,
          },
          {
            id: 2,
            date: '2024-01-15',
            label: 'Transaction 2',
            amount: -50,
          },
        ],
        balances: [
          {
            date: '2024-01-31',
            balance: 50,
          },
        ],
      };

      const result = service.validateMovements(request);
      expect(result.message).toBe('Accepted');
    });

    it('should detect balance mismatch', () => {
      const request: ValidationRequestDto = {
        movements: [
          {
            id: 1,
            date: '2024-01-01',
            label: 'Transaction 1',
            amount: 100,
          },
          {
            id: 2,
            date: '2024-01-15',
            label: 'Transaction 2',
            amount: -50,
          },
          {
            id: 3,
            date: '2024-02-10',
            label: 'Transaction 3',
            amount: 25,
          },
        ],
        balances: [
          {
            date: '2024-01-31',
            balance: 50, // Correct: 0 (inferred) + 100 - 50 = 50
          },
          {
            date: '2024-02-28',
            balance: 100, // Should be 75 (50 + 25), but is 100
          },
        ],
      };

      const result = service.validateMovements(request);
      expect(result.message).toBe('Validation failed');
      if ('reasons' in result) {
        expect(result.reasons.length).toBeGreaterThan(0);
        const balanceMismatch = result.reasons.find(
          (r) => r.type === 'BALANCE_MISMATCH',
        );
        expect(balanceMismatch).toBeDefined();
      }
    });

    it('should detect duplicate transactions', () => {
      const request: ValidationRequestDto = {
        movements: [
          {
            id: 1,
            date: '2024-01-01',
            label: 'Payment ABC',
            amount: 100,
          },
          {
            id: 2,
            date: '2024-01-01',
            label: 'Payment ABC',
            amount: 100,
          },
        ],
        balances: [
          {
            date: '2024-01-31',
            balance: 200,
          },
        ],
      };

      const result = service.validateMovements(request);
      expect(result.message).toBe('Validation failed');
      if ('reasons' in result) {
        const duplicateReason = result.reasons.find(
          (r) => r.type === 'DUPLICATE_TRANSACTION',
        );
        expect(duplicateReason).toBeDefined();
      }
    });

    it('should detect movements after last balance point', () => {
      const request: ValidationRequestDto = {
        movements: [
          {
            id: 1,
            date: '2024-01-01',
            label: 'Transaction 1',
            amount: 100,
          },
          {
            id: 2,
            date: '2024-02-15',
            label: 'Transaction 2',
            amount: 50,
          },
        ],
        balances: [
          {
            date: '2024-01-31',
            balance: 100,
          },
        ],
      };

      const result = service.validateMovements(request);
      expect(result.message).toBe('Validation failed');
      if ('reasons' in result) {
        const missingReason = result.reasons.find(
          (r) => r.type === 'MISSING_TRANSACTION',
        );
        expect(missingReason).toBeDefined();
      }
    });

    it('should detect balance mismatch at first control point', () => {
      // This test corresponds to example-balance-mismatch.json
      const request: ValidationRequestDto = {
        movements: [
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
          {
            id: 3,
            date: '2024-01-15',
            label: 'UTILITIES',
            amount: -150.0,
          },
          {
            id: 4,
            date: '2024-01-20',
            label: 'GROCERY STORE',
            amount: -120.5,
          },
        ],
        balances: [
          {
            date: '2024-01-31',
            balance: 2000.0, // Should be 1929.50 (3000 - 800 - 150 - 120.5)
          },
        ],
      };

      const result = service.validateMovements(request);
      expect(result.message).toBe('Validation failed');
      if ('reasons' in result) {
        const balanceMismatch = result.reasons.find(
          (r) => r.type === 'BALANCE_MISMATCH',
        );
        expect(balanceMismatch).toBeDefined();
        if (balanceMismatch && balanceMismatch.details) {
          expect(balanceMismatch.details.expectedBalance).toBe(1929.5);
          expect(balanceMismatch.details.actualBalance).toBe(2000.0);
          expect(balanceMismatch.details.difference).toBeCloseTo(-70.5, 1);
        }
      }
    });

    it('should accept valid first balance point when movements exist before it', () => {
      const request: ValidationRequestDto = {
        movements: [
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
          {
            id: 3,
            date: '2024-01-15',
            label: 'UTILITIES',
            amount: -150.0,
          },
          {
            id: 4,
            date: '2024-01-20',
            label: 'GROCERY STORE',
            amount: -120.5,
          },
        ],
        balances: [
          {
            date: '2024-01-31',
            balance: 1929.5, // Correct: 3000 - 800 - 150 - 120.5 = 1929.5
          },
        ],
      };

      const result = service.validateMovements(request);
      expect(result.message).toBe('Accepted');
    });

    it('should detect invalid date order in balances', () => {
      const request: ValidationRequestDto = {
        movements: [
          {
            id: 1,
            date: '2024-01-15',
            label: 'Transaction 1',
            amount: 100,
          },
        ],
        balances: [
          {
            date: '2024-01-31',
            balance: 100,
          },
          {
            date: '2024-01-31', // Invalid: same date as previous (<= condition)
            balance: 50,
          },
        ],
      };

      const result = service.validateMovements(request);
      expect(result.message).toBe('Validation failed');
      if ('reasons' in result) {
        const invalidOrderReason = result.reasons.find(
          (r) => r.type === 'INVALID_DATE_ORDER',
        );
        expect(invalidOrderReason).toBeDefined();
      }
    });

    it('should detect invalid date order with equal dates', () => {
      const request: ValidationRequestDto = {
        movements: [
          {
            id: 1,
            date: '2024-01-15',
            label: 'Transaction 1',
            amount: 100,
          },
        ],
        balances: [
          {
            date: '2024-01-31',
            balance: 100,
          },
          {
            date: '2024-01-31', // Invalid: same date as previous
            balance: 100,
          },
        ],
      };

      const result = service.validateMovements(request);
      expect(result.message).toBe('Validation failed');
      if ('reasons' in result) {
        const invalidOrderReason = result.reasons.find(
          (r) => r.type === 'INVALID_DATE_ORDER',
        );
        expect(invalidOrderReason).toBeDefined();
      }
    });

    it('should return error when no balances provided', () => {
      const request: ValidationRequestDto = {
        movements: [
          {
            id: 1,
            date: '2024-01-15',
            label: 'Transaction 1',
            amount: 100,
          },
        ],
        balances: [],
      };

      const result = service.validateMovements(request);
      expect(result.message).toBe('Validation failed');
      if ('reasons' in result) {
        const noBalanceReason = result.reasons.find(
          (r) =>
            r.type === 'BALANCE_MISMATCH' && r.message.includes('No balance'),
        );
        expect(noBalanceReason).toBeDefined();
      }
    });

    it('should detect duplicates with similar labels using Levenshtein', () => {
      const request: ValidationRequestDto = {
        movements: [
          {
            id: 1,
            date: '2024-01-01',
            label: 'PAYMENT ABC',
            amount: 100,
          },
          {
            id: 2,
            date: '2024-01-01',
            label: 'PAYMENT ABD', // Similar (1 char difference, >80% similarity)
            amount: 100,
          },
        ],
        balances: [
          {
            date: '2024-01-31',
            balance: 200,
          },
        ],
      };

      const result = service.validateMovements(request);
      expect(result.message).toBe('Validation failed');
      if ('reasons' in result) {
        const duplicateReason = result.reasons.find(
          (r) => r.type === 'DUPLICATE_TRANSACTION',
        );
        expect(duplicateReason).toBeDefined();
      }
    });

    it('should detect duplicates when one label contains the other', () => {
      const request: ValidationRequestDto = {
        movements: [
          {
            id: 1,
            date: '2024-01-01',
            label: 'PAYMENT',
            amount: 100,
          },
          {
            id: 2,
            date: '2024-01-01',
            label: 'PAYMENT REF 12345', // Contains "PAYMENT"
            amount: 100,
          },
        ],
        balances: [
          {
            date: '2024-01-31',
            balance: 200,
          },
        ],
      };

      const result = service.validateMovements(request);
      expect(result.message).toBe('Validation failed');
      if ('reasons' in result) {
        const duplicateReason = result.reasons.find(
          (r) => r.type === 'DUPLICATE_TRANSACTION',
        );
        expect(duplicateReason).toBeDefined();
      }
    });

    it('should not detect duplicates when labels are different enough', () => {
      const request: ValidationRequestDto = {
        movements: [
          {
            id: 1,
            date: '2024-01-01',
            label: 'PAYMENT ABC',
            amount: 100,
          },
          {
            id: 2,
            date: '2024-01-01',
            label: 'WITHDRAWAL XYZ', // Very different (<80% similarity)
            amount: 100,
          },
        ],
        balances: [
          {
            date: '2024-01-31',
            balance: 200,
          },
        ],
      };

      const result = service.validateMovements(request);
      // Should not detect duplicates, but might have other issues
      if ('reasons' in result) {
        const duplicateReason = result.reasons.find(
          (r) => r.type === 'DUPLICATE_TRANSACTION',
        );
        expect(duplicateReason).toBeUndefined();
      }
    });

    it('should handle empty movements array', () => {
      const request: ValidationRequestDto = {
        movements: [],
        balances: [
          {
            date: '2024-01-31',
            balance: 0,
          },
        ],
      };

      const result = service.validateMovements(request);
      // Should accept if balance is 0 and no movements
      expect(result.message).toBe('Accepted');
    });

    it('should handle movements with special characters in labels', () => {
      const request: ValidationRequestDto = {
        movements: [
          {
            id: 1,
            date: '2024-01-01',
            label: 'PAYMENT #123!@#$%',
            amount: 100,
          },
          {
            id: 2,
            date: '2024-01-01',
            label: 'PAYMENT 123', // Should match after normalization
            amount: 100,
          },
        ],
        balances: [
          {
            date: '2024-01-31',
            balance: 200,
          },
        ],
      };

      const result = service.validateMovements(request);
      expect(result.message).toBe('Validation failed');
      if ('reasons' in result) {
        const duplicateReason = result.reasons.find(
          (r) => r.type === 'DUPLICATE_TRANSACTION',
        );
        expect(duplicateReason).toBeDefined();
      }
    });

    it('should handle multiple balance points with correct validation', () => {
      const request: ValidationRequestDto = {
        movements: [
          {
            id: 1,
            date: '2024-01-05',
            label: 'SALARY',
            amount: 3000,
          },
          {
            id: 2,
            date: '2024-01-10',
            label: 'RENT',
            amount: -800,
          },
          {
            id: 3,
            date: '2024-02-05',
            label: 'SALARY',
            amount: 3000,
          },
          {
            id: 4,
            date: '2024-02-10',
            label: 'RENT',
            amount: -800,
          },
        ],
        balances: [
          {
            date: '2024-01-31',
            balance: 2200, // 3000 - 800
          },
          {
            date: '2024-02-28',
            balance: 4400, // 2200 + 3000 - 800
          },
        ],
      };

      const result = service.validateMovements(request);
      expect(result.message).toBe('Accepted');
    });
  });
});
