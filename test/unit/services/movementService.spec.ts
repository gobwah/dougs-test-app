import { Test, TestingModule } from '@nestjs/testing';
import { BalanceService } from '../../../src/models/balances/balance.service';
import { DuplicateService } from '../../../src/models/duplicates/duplicate.service';
import { ValidationRequestDto } from '../../../src/models/movements/dto/request.dto';
import { MovementService } from '../../../src/models/movements/movement.service';

/**
 * Tests d'intégration pour MovementService
 * Ces tests vérifient l'orchestration des utilitaires.
 * Les détails de chaque fonction utilitaire sont testés dans leurs propres fichiers de test.
 */
describe('MovementService', () => {
  let service: MovementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MovementService, DuplicateService, BalanceService],
    }).compile();

    service = module.get<MovementService>(MovementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateMovements - Orchestration', () => {
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

    it('should detect and collect multiple types of errors', () => {
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
            label: 'Payment ABC', // Duplicate
            amount: 100,
          },
          {
            id: 3,
            date: '2024-02-15',
            label: 'Transaction 3',
            amount: 50, // After last balance
          },
        ],
        balances: [
          {
            date: '2024-01-31',
            balance: 150, // Should be 200 (100 + 100)
          },
        ],
      };

      const result = service.validateMovements(request);
      expect(result.message).toBe('Validation failed');
      if ('reasons' in result) {
        expect(result.reasons.length).toBeGreaterThan(0);
        // Should detect duplicate
        expect(
          result.reasons.some((r) => r.type === 'DUPLICATE_TRANSACTION'),
        ).toBe(true);
        // Should detect balance mismatch
        expect(result.reasons.some((r) => r.type === 'BALANCE_MISMATCH')).toBe(
          true,
        );
        // Should detect missing transaction
        expect(
          result.reasons.some((r) => r.type === 'MISSING_TRANSACTION'),
        ).toBe(true);
      }
    });

    it('should handle complex scenario with multiple balance points', () => {
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
          (r) => r.type === 'BALANCE_MISMATCH',
        );
        expect(noBalanceReason).toBeDefined();
        if (noBalanceReason) {
          expect(
            noBalanceReason.errors.some((e) =>
              e.message.includes('No balance'),
            ),
          ).toBe(true);
        }
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
      expect(result.message).toBe('Accepted');
    });
  });
});
