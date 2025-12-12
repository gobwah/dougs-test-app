import { Test, TestingModule } from '@nestjs/testing';
import { BalanceService } from '../../../src/models/balances/balance.service';
import { ValidationReasonType } from '../../../src/models/movements/dto/response.dto';
import { Balance } from '../../../src/models/balances/entities/balance.entity';
import { Movement } from '../../../src/models/movements/entities/movement.entity';

describe('BalanceService', () => {
  let service: BalanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BalanceService],
    }).compile();

    service = module.get<BalanceService>(BalanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateDateOrder', () => {
    it('should not add reasons for valid chronological order', () => {
      const balances: Balance[] = [
        {
          date: new Date('2024-01-31'),
          balance: 50,
        },
        {
          date: new Date('2024-02-28'),
          balance: 100,
        },
      ];

      const reasons: any[] = [];
      service.validateDateOrder(balances, reasons);

      expect(reasons).toHaveLength(0);
    });

    it('should add reasons for invalid order', () => {
      const balances: Balance[] = [
        {
          date: new Date('2024-02-28'),
          balance: 100,
        },
        {
          date: new Date('2024-01-31'),
          balance: 50,
        },
      ];

      const reasons: any[] = [];
      service.validateDateOrder(balances, reasons);

      expect(reasons).toHaveLength(1);
      expect(reasons[0].type).toBe(ValidationReasonType.INVALID_DATE_ORDER);
      expect(reasons[0].message).toBe(
        'Balance control points must be in chronological order',
      );
      expect(reasons[0].details.balanceDate).toBe(
        new Date('2024-01-31').toISOString(),
      );
      expect(reasons[0].details.balanceIndex).toBe(1);
    });

    it('should add reasons for equal dates', () => {
      const balances: Balance[] = [
        {
          date: new Date('2024-01-31'),
          balance: 50,
        },
        {
          date: new Date('2024-01-31'),
          balance: 100,
        },
      ];

      const reasons: any[] = [];
      service.validateDateOrder(balances, reasons);

      expect(reasons).toHaveLength(1);
      expect(reasons[0].type).toBe(ValidationReasonType.INVALID_DATE_ORDER);
      expect(reasons[0].details.balanceIndex).toBe(1);
    });

    it('should handle empty array', () => {
      const reasons: any[] = [];
      service.validateDateOrder([], reasons);

      expect(reasons).toHaveLength(0);
    });

    it('should handle single balance', () => {
      const balances: Balance[] = [
        {
          date: new Date('2024-01-31'),
          balance: 50,
        },
      ];

      const reasons: any[] = [];
      service.validateDateOrder(balances, reasons);

      expect(reasons).toHaveLength(0);
    });

    it('should add multiple reasons for multiple invalid dates', () => {
      const balances: Balance[] = [
        {
          date: new Date('2024-02-28'),
          balance: 100,
        },
        {
          date: new Date('2024-01-31'),
          balance: 50,
        },
        {
          date: new Date('2024-01-15'),
          balance: 25,
        },
      ];

      const reasons: any[] = [];
      service.validateDateOrder(balances, reasons);

      expect(reasons).toHaveLength(2);
      expect(reasons[0].type).toBe(ValidationReasonType.INVALID_DATE_ORDER);
      expect(reasons[0].details.balanceIndex).toBe(1);
      expect(reasons[1].type).toBe(ValidationReasonType.INVALID_DATE_ORDER);
      expect(reasons[1].details.balanceIndex).toBe(2);
    });
  });

  describe('validateBalances', () => {
    it('should add error when no balances provided', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-05'),
          label: 'SALARY',
          amount: 1000,
        },
      ];

      const reasons: any[] = [];
      service.validateBalances([], movements, reasons);

      expect(reasons).toHaveLength(1);
      expect(reasons[0].type).toBe(ValidationReasonType.BALANCE_MISMATCH);
      expect(reasons[0].message).toBe('No balance control points provided');
    });

    it('should not add reasons when no movements', () => {
      const balances: Balance[] = [
        {
          date: new Date('2024-01-31'),
          balance: 0,
        },
      ];

      const reasons: any[] = [];
      service.validateBalances(balances, [], reasons);

      expect(reasons).toHaveLength(0);
    });

    it('should validate first balance correctly', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-05'),
          label: 'SALARY',
          amount: 3000,
        },
        {
          id: 2,
          date: new Date('2024-01-10'),
          label: 'RENT',
          amount: -800,
        },
      ];

      const balances: Balance[] = [
        {
          date: new Date('2024-01-31'),
          balance: 2200, // 3000 - 800
        },
      ];

      const reasons: any[] = [];
      service.validateBalances(balances, movements, reasons);

      expect(reasons).toHaveLength(0);
    });

    it('should detect first balance mismatch', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-05'),
          label: 'SALARY',
          amount: 3000,
        },
        {
          id: 2,
          date: new Date('2024-01-10'),
          label: 'RENT',
          amount: -800,
        },
      ];

      const balances: Balance[] = [
        {
          date: new Date('2024-01-31'),
          balance: 2000, // Should be 2200
        },
      ];

      const reasons: any[] = [];
      service.validateBalances(balances, movements, reasons);

      expect(reasons).toHaveLength(1);
      expect(reasons[0].type).toBe(ValidationReasonType.BALANCE_MISMATCH);
      expect(reasons[0].details.expectedBalance).toBe(2200);
      expect(reasons[0].details.actualBalance).toBe(2000);
    });

    it('should validate subsequent balances correctly', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-05'),
          label: 'SALARY',
          amount: 3000,
        },
        {
          id: 2,
          date: new Date('2024-01-10'),
          label: 'RENT',
          amount: -800,
        },
        {
          id: 3,
          date: new Date('2024-02-05'),
          label: 'SALARY',
          amount: 3000,
        },
        {
          id: 4,
          date: new Date('2024-02-10'),
          label: 'RENT',
          amount: -800,
        },
      ];

      const balances: Balance[] = [
        {
          date: new Date('2024-01-31'),
          balance: 2200, // 3000 - 800
        },
        {
          date: new Date('2024-02-28'),
          balance: 4400, // 2200 + 3000 - 800
        },
      ];

      const reasons: any[] = [];
      service.validateBalances(balances, movements, reasons);

      expect(reasons).toHaveLength(0);
    });

    it('should detect subsequent balance mismatch', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-05'),
          label: 'SALARY',
          amount: 3000,
        },
        {
          id: 2,
          date: new Date('2024-01-10'),
          label: 'RENT',
          amount: -800,
        },
        {
          id: 3,
          date: new Date('2024-02-05'),
          label: 'SALARY',
          amount: 3000,
        },
      ];

      const balances: Balance[] = [
        {
          date: new Date('2024-01-31'),
          balance: 2200,
        },
        {
          date: new Date('2024-02-28'),
          balance: 5000, // Should be 5200 (2200 + 3000)
        },
      ];

      const reasons: any[] = [];
      service.validateBalances(balances, movements, reasons);

      expect(reasons).toHaveLength(1);
      expect(reasons[0].type).toBe(ValidationReasonType.BALANCE_MISMATCH);
      expect(reasons[0].details.expectedBalance).toBe(5200);
      expect(reasons[0].details.actualBalance).toBe(5000);
    });

    it('should detect movements after last balance', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-05'),
          label: 'SALARY',
          amount: 1000,
        },
        {
          id: 2,
          date: new Date('2024-02-15'),
          label: 'RENT',
          amount: -500,
        },
      ];

      const balances: Balance[] = [
        {
          date: new Date('2024-01-31'),
          balance: 1000,
        },
      ];

      const reasons: any[] = [];
      service.validateBalances(balances, movements, reasons);

      expect(reasons).toHaveLength(1);
      expect(reasons[0].type).toBe(ValidationReasonType.MISSING_TRANSACTION);
      expect(reasons[0].details.missingAmount).toBe(-500);
    });

    it('should handle tolerance for floating point differences', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-05'),
          label: 'SALARY',
          amount: 100.005,
        },
      ];

      const balances: Balance[] = [
        {
          date: new Date('2024-01-31'),
          balance: 100.01, // Difference of 0.005, within tolerance
        },
      ];

      const reasons: any[] = [];
      service.validateBalances(balances, movements, reasons);

      expect(reasons).toHaveLength(0);
    });

    it('should not add error when no movements before first balance', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-02-05'),
          label: 'SALARY',
          amount: 3000,
        },
      ];

      const balances: Balance[] = [
        {
          date: new Date('2024-01-31'),
          balance: 0,
        },
      ];

      const reasons: any[] = [];
      service.validateBalances(balances, movements, reasons);

      // No error for first balance (trusted as per problem statement)
      // But may detect movements after last balance
      const firstBalanceErrors = reasons.filter(
        (r) =>
          r.type === ValidationReasonType.BALANCE_MISMATCH &&
          r.message.includes('first'),
      );
      expect(firstBalanceErrors).toHaveLength(0);
    });

    it('should handle empty balances array in checkMovementsAfterLastBalance', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-05'),
          label: 'SALARY',
          amount: 1000,
        },
      ];

      const reasons: any[] = [];
      service.validateBalances([], movements, reasons);

      // Should only have the "no balances" error, not a "movements after" error
      expect(reasons).toHaveLength(1);
      expect(reasons[0].type).toBe(ValidationReasonType.BALANCE_MISMATCH);
      expect(reasons[0].message).toBe('No balance control points provided');
    });
  });
});
