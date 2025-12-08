import {
  validateBalanceDateOrder,
  validateDateOrder,
} from '../../../src/movements/utils/balanceUtils';
import { Balance } from '../../../src/movements/utils/parsingUtils';
import { ValidationReasonType } from '../../../src/movements/dto/responseDto';

describe('BalanceUtils', () => {
  describe('validateBalanceDateOrder', () => {
    it('should return true for valid chronological order', () => {
      const balances: Balance[] = [
        {
          date: new Date('2024-01-31'),
          balance: 50,
        },
        {
          date: new Date('2024-02-28'),
          balance: 100,
        },
        {
          date: new Date('2024-03-31'),
          balance: 150,
        },
      ];

      const result = validateBalanceDateOrder(balances);
      expect(result).toBe(true);
    });

    it('should return false for invalid order (descending)', () => {
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

      const result = validateBalanceDateOrder(balances);
      expect(result).toBe(false);
    });

    it('should return false for equal dates', () => {
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

      const result = validateBalanceDateOrder(balances);
      expect(result).toBe(false);
    });

    it('should return true for single balance', () => {
      const balances: Balance[] = [
        {
          date: new Date('2024-01-31'),
          balance: 50,
        },
      ];

      const result = validateBalanceDateOrder(balances);
      expect(result).toBe(true);
    });

    it('should return true for empty array', () => {
      const result = validateBalanceDateOrder([]);
      expect(result).toBe(true);
    });

    it('should handle dates with different times on same day', () => {
      const balances: Balance[] = [
        {
          date: new Date('2024-01-31T10:00:00'),
          balance: 50,
        },
        {
          date: new Date('2024-01-31T11:00:00'),
          balance: 100,
        },
      ];

      // Should return true because dates are different (different times)
      const result = validateBalanceDateOrder(balances);
      expect(result).toBe(true);
    });
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
      validateDateOrder(balances, reasons);

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
      validateDateOrder(balances, reasons);

      expect(reasons).toHaveLength(1);
      expect(reasons[0].type).toBe(ValidationReasonType.INVALID_DATE_ORDER);
      expect(reasons[0].message).toBe(
        'Balance control points must be in chronological order',
      );
      expect(reasons[0].details.balanceDate).toBe(
        new Date('2024-01-31').toISOString(),
      );
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
      validateDateOrder(balances, reasons);

      expect(reasons).toHaveLength(1);
      expect(reasons[0].type).toBe(ValidationReasonType.INVALID_DATE_ORDER);
    });

    it('should handle empty array', () => {
      const reasons: any[] = [];
      validateDateOrder([], reasons);

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
      validateDateOrder(balances, reasons);

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
      validateDateOrder(balances, reasons);

      expect(reasons).toHaveLength(2);
      expect(reasons[0].type).toBe(ValidationReasonType.INVALID_DATE_ORDER);
      expect(reasons[1].type).toBe(ValidationReasonType.INVALID_DATE_ORDER);
    });
  });
});
