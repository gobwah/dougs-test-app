import {
  validateFirstBalance,
  validateSubsequentBalances,
  checkMovementsAfterLastBalance,
} from '../../../src/movements/utils/validation.util';
import {
  filterMovementsUpToDate,
  filterMovementsBetweenDates,
  sumMovementAmounts,
} from '../../../src/movements/utils/movement.util';
import { Movement, Balance } from '../../../src/movements/utils/parsing.util';
import { ValidationReasonType } from '../../../src/movements/dto/response.dto';

describe('ValidationUtils', () => {
  describe('filterMovementsUpToDate', () => {
    it('should filter movements up to and including the date', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-05'),
          label: 'Transaction 1',
          amount: 100,
        },
        {
          id: 2,
          date: new Date('2024-01-10'),
          label: 'Transaction 2',
          amount: -50,
        },
        {
          id: 3,
          date: new Date('2024-01-15'),
          label: 'Transaction 3',
          amount: 25,
        },
      ];

      const result = filterMovementsUpToDate(movements, new Date('2024-01-10'));

      expect(result).toHaveLength(2);
      expect(result.map((m) => m.id)).toEqual([1, 2]);
    });

    it('should return empty array if no movements before date', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-15'),
          label: 'Transaction 1',
          amount: 100,
        },
      ];

      const result = filterMovementsUpToDate(movements, new Date('2024-01-10'));

      expect(result).toHaveLength(0);
    });

    it('should return all movements if date is after all', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-05'),
          label: 'Transaction 1',
          amount: 100,
        },
      ];

      const result = filterMovementsUpToDate(movements, new Date('2024-01-31'));

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('should handle empty array', () => {
      const result = filterMovementsUpToDate([], new Date('2024-01-31'));
      expect(result).toHaveLength(0);
    });
  });

  describe('filterMovementsBetweenDates', () => {
    it('should filter movements between two dates (exclusive start, inclusive end)', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-05'),
          label: 'Transaction 1',
          amount: 100,
        },
        {
          id: 2,
          date: new Date('2024-01-10'),
          label: 'Transaction 2',
          amount: -50,
        },
        {
          id: 3,
          date: new Date('2024-01-15'),
          label: 'Transaction 3',
          amount: 25,
        },
        {
          id: 4,
          date: new Date('2024-01-20'),
          label: 'Transaction 4',
          amount: -30,
        },
      ];

      const result = filterMovementsBetweenDates(
        movements,
        new Date('2024-01-05'),
        new Date('2024-01-15'),
      );

      expect(result).toHaveLength(2);
      expect(result.map((m) => m.id)).toEqual([2, 3]);
    });

    it('should exclude movements on start date', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-05'),
          label: 'Transaction 1',
          amount: 100,
        },
        {
          id: 2,
          date: new Date('2024-01-10'),
          label: 'Transaction 2',
          amount: -50,
        },
      ];

      const result = filterMovementsBetweenDates(
        movements,
        new Date('2024-01-05'),
        new Date('2024-01-10'),
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    it('should include movements on end date', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-10'),
          label: 'Transaction 1',
          amount: 100,
        },
        {
          id: 2,
          date: new Date('2024-01-15'),
          label: 'Transaction 2',
          amount: -50,
        },
      ];

      const result = filterMovementsBetweenDates(
        movements,
        new Date('2024-01-05'),
        new Date('2024-01-15'),
      );

      expect(result).toHaveLength(2);
      expect(result.map((m) => m.id)).toEqual([1, 2]);
    });

    it('should return empty array if no movements in period', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-05'),
          label: 'Transaction 1',
          amount: 100,
        },
      ];

      const result = filterMovementsBetweenDates(
        movements,
        new Date('2024-01-10'),
        new Date('2024-01-15'),
      );

      expect(result).toHaveLength(0);
    });
  });

  describe('sumMovementAmounts', () => {
    it('should sum all movement amounts', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-01'),
          label: 'Transaction 1',
          amount: 100,
        },
        {
          id: 2,
          date: new Date('2024-01-02'),
          label: 'Transaction 2',
          amount: -50,
        },
        {
          id: 3,
          date: new Date('2024-01-03'),
          label: 'Transaction 3',
          amount: 25,
        },
      ];

      const result = sumMovementAmounts(movements);
      expect(result).toBe(75);
    });

    it('should return 0 for empty array', () => {
      const result = sumMovementAmounts([]);
      expect(result).toBe(0);
    });

    it('should handle negative amounts', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-01'),
          label: 'Transaction 1',
          amount: -100,
        },
        {
          id: 2,
          date: new Date('2024-01-02'),
          label: 'Transaction 2',
          amount: -50,
        },
      ];

      const result = sumMovementAmounts(movements);
      expect(result).toBe(-150);
    });
  });

  describe('validateFirstBalance', () => {
    it('should return null if balance is correct', () => {
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

      const firstBalance: Balance = {
        date: new Date('2024-01-31'),
        balance: 2200, // 3000 - 800
      };

      const result = validateFirstBalance(firstBalance, movements);
      expect(result).toBeNull();
    });

    it('should return error if balance is incorrect', () => {
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

      const firstBalance: Balance = {
        date: new Date('2024-01-31'),
        balance: 2000, // Should be 2200
      };

      const result = validateFirstBalance(firstBalance, movements);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.type).toBe(ValidationReasonType.BALANCE_MISMATCH);
        expect(result.details.expectedBalance).toBe(2200);
        expect(result.details.actualBalance).toBe(2000);
        expect(result.details.difference).toBe(200);
      }
    });

    it('should return null if no movements before first balance', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-02-05'),
          label: 'SALARY',
          amount: 3000,
        },
      ];

      const firstBalance: Balance = {
        date: new Date('2024-01-31'),
        balance: 0,
      };

      const result = validateFirstBalance(firstBalance, movements);
      expect(result).toBeNull();
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

      const firstBalance: Balance = {
        date: new Date('2024-01-31'),
        balance: 100.01, // Difference of 0.005, within tolerance
      };

      const result = validateFirstBalance(firstBalance, movements);
      expect(result).toBeNull();
    });
  });

  describe('validateSubsequentBalances', () => {
    it('should return empty array if all balances are correct', () => {
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

      const result = validateSubsequentBalances(balances, movements);
      expect(result).toHaveLength(0);
    });

    it('should return errors for incorrect balances', () => {
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
          balance: 5000, // Should be 4400 (2200 + 3000)
        },
      ];

      const result = validateSubsequentBalances(balances, movements);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(ValidationReasonType.BALANCE_MISMATCH);
      expect(result[0].details.expectedBalance).toBe(5200);
      expect(result[0].details.actualBalance).toBe(5000);
    });

    it('should handle multiple balance points', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-05'),
          label: 'SALARY',
          amount: 1000,
        },
        {
          id: 2,
          date: new Date('2024-02-05'),
          label: 'SALARY',
          amount: 1000,
        },
        {
          id: 3,
          date: new Date('2024-03-05'),
          label: 'SALARY',
          amount: 1000,
        },
      ];

      const balances: Balance[] = [
        {
          date: new Date('2024-01-31'),
          balance: 1000,
        },
        {
          date: new Date('2024-02-28'),
          balance: 2000,
        },
        {
          date: new Date('2024-03-31'),
          balance: 3000,
        },
      ];

      const result = validateSubsequentBalances(balances, movements);
      expect(result).toHaveLength(0);
    });

    it('should handle single balance point (no subsequent balances)', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-05'),
          label: 'SALARY',
          amount: 1000,
        },
      ];

      const balances: Balance[] = [
        {
          date: new Date('2024-01-31'),
          balance: 1000,
        },
      ];

      const result = validateSubsequentBalances(balances, movements);
      expect(result).toHaveLength(0);
    });
  });

  describe('checkMovementsAfterLastBalance', () => {
    it('should return null if no movements after last balance', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-05'),
          label: 'SALARY',
          amount: 1000,
        },
      ];

      const balances: Balance[] = [
        {
          date: new Date('2024-01-31'),
          balance: 1000,
        },
      ];

      const result = checkMovementsAfterLastBalance(balances, movements);
      expect(result).toBeNull();
    });

    it('should return error if movements exist after last balance', () => {
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

      const result = checkMovementsAfterLastBalance(balances, movements);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.type).toBe(ValidationReasonType.MISSING_TRANSACTION);
        expect(result.details.missingAmount).toBe(-500);
        expect(result.details.periodStart).toBe(
          new Date('2024-01-31').toISOString(),
        );
        expect(result.details.periodEnd).toBe(
          new Date('2024-02-15').toISOString(),
        );
      }
    });

    it('should handle empty balances array', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-05'),
          label: 'SALARY',
          amount: 1000,
        },
      ];

      const result = checkMovementsAfterLastBalance([], movements);
      expect(result).toBeNull();
    });

    it('should calculate total amount correctly for multiple movements', () => {
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
        {
          id: 3,
          date: new Date('2024-02-20'),
          label: 'UTILITIES',
          amount: -100,
        },
      ];

      const balances: Balance[] = [
        {
          date: new Date('2024-01-31'),
          balance: 1000,
        },
      ];

      const result = checkMovementsAfterLastBalance(balances, movements);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.details.missingAmount).toBe(-600); // -500 + -100
      }
    });
  });
});
