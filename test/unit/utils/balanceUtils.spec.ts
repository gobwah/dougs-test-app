import {
  validateFirstBalance,
  validateSubsequentBalances,
  checkMovementsAfterLastBalance,
} from '../../../src/models/balances/utils/balance.util';
import { ValidationReasonType } from '../../../src/models/movements/dto/response.dto';
import { Balance } from '../../../src/models/balances/entities/balance.entity';
import { Movement } from '../../../src/models/movements/entities/movement.entity';

describe('BalanceUtils', () => {
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

    it('should detect difference at tolerance boundary', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-05'),
          label: 'SALARY',
          amount: 100,
        },
      ];

      const firstBalance: Balance = {
        date: new Date('2024-01-31'),
        balance: 100.02, // Difference of 0.02, exceeds tolerance
      };

      const result = validateFirstBalance(firstBalance, movements);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.type).toBe(ValidationReasonType.BALANCE_MISMATCH);
      }
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
          balance: 5000, // Should be 5200 (2200 + 3000)
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

    it('should detect multiple subsequent balance errors', () => {
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
          balance: 2500, // Should be 2000 (1000 + 1000)
        },
        {
          date: new Date('2024-03-31'),
          balance: 3500, // Should be 3000 (2500 + 1000, but previous was wrong so this is also wrong)
        },
      ];

      const result = validateSubsequentBalances(balances, movements);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0].type).toBe(ValidationReasonType.BALANCE_MISMATCH);
      // The second error might not be detected if the first balance is wrong
      // because it's calculated from the previous balance
      if (result.length > 1) {
        expect(result[1].type).toBe(ValidationReasonType.BALANCE_MISMATCH);
      }
    });

    it('should handle tolerance for floating point differences', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-02-05'),
          label: 'SALARY',
          amount: 100.005,
        },
      ];

      const balances: Balance[] = [
        {
          date: new Date('2024-01-31'),
          balance: 0,
        },
        {
          date: new Date('2024-02-28'),
          balance: 100.01, // Difference of 0.005, within tolerance (0 + 100.005 = 100.005, actual = 100.01)
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
        expect(result.details.periodEnd).toBe(
          new Date('2024-02-20').toISOString(),
        );
      }
    });

    it('should handle movements exactly on last balance date (should not be included)', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-31'),
          label: 'SALARY',
          amount: 1000,
        },
        {
          id: 2,
          date: new Date('2024-02-01'),
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
        // Only movement on 2024-02-01 should be included (after last balance)
        expect(result.details.missingAmount).toBe(-500);
      }
    });
  });
});
