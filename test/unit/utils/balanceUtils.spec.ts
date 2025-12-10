import { validateDateOrder } from '../../../src/movements/utils/balance.util';
import { Balance } from '../../../src/movements/utils/parsing.util';
import { ValidationReasonType } from '../../../src/movements/dto/response.dto';

describe('BalanceUtils', () => {
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
