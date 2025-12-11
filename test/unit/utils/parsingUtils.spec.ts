import {
  parseAndSortMovements,
  parseAndSortBalances,
} from '../../../src/models/movements/utils/parsing.util';
import {
  MovementDto,
  BalanceDto,
} from '../../../src/models/movements/dto/request.dto';

describe('ParsingUtils', () => {
  describe('parseAndSortMovements', () => {
    it('should parse and sort movements by date', () => {
      const movements: MovementDto[] = [
        {
          id: 2,
          date: '2024-01-15',
          label: 'Transaction 2',
          amount: -50,
        },
        {
          id: 1,
          date: '2024-01-01',
          label: 'Transaction 1',
          amount: 100,
        },
        {
          id: 3,
          date: '2024-01-20',
          label: 'Transaction 3',
          amount: 25,
        },
      ];

      const result = parseAndSortMovements(movements);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(1);
      expect(result[0].date).toEqual(new Date('2024-01-01'));
      expect(result[1].id).toBe(2);
      expect(result[1].date).toEqual(new Date('2024-01-15'));
      expect(result[2].id).toBe(3);
      expect(result[2].date).toEqual(new Date('2024-01-20'));
    });

    it('should handle empty array', () => {
      const result = parseAndSortMovements([]);
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should handle single movement', () => {
      const movements: MovementDto[] = [
        {
          id: 1,
          date: '2024-01-01',
          label: 'Transaction 1',
          amount: 100,
        },
      ];

      const result = parseAndSortMovements(movements);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].date).toEqual(new Date('2024-01-01'));
    });

    it('should handle movements with same date', () => {
      const movements: MovementDto[] = [
        {
          id: 2,
          date: '2024-01-01',
          label: 'Transaction 2',
          amount: -50,
        },
        {
          id: 1,
          date: '2024-01-01',
          label: 'Transaction 1',
          amount: 100,
        },
      ];

      const result = parseAndSortMovements(movements);

      expect(result).toHaveLength(2);
      // Should maintain relative order for same dates (stable sort)
      expect(result[0].id).toBe(2);
      expect(result[1].id).toBe(1);
    });
  });

  describe('parseAndSortBalances', () => {
    it('should parse and sort balances by date', () => {
      const balances: BalanceDto[] = [
        {
          date: '2024-02-28',
          balance: 100,
        },
        {
          date: '2024-01-31',
          balance: 50,
        },
        {
          date: '2024-03-31',
          balance: 150,
        },
      ];

      const result = parseAndSortBalances(balances);

      expect(result).toHaveLength(3);
      expect(result[0].date).toEqual(new Date('2024-01-31'));
      expect(result[0].balance).toBe(50);
      expect(result[1].date).toEqual(new Date('2024-02-28'));
      expect(result[1].balance).toBe(100);
      expect(result[2].date).toEqual(new Date('2024-03-31'));
      expect(result[2].balance).toBe(150);
    });

    it('should handle empty array', () => {
      const result = parseAndSortBalances([]);
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should handle single balance', () => {
      const balances: BalanceDto[] = [
        {
          date: '2024-01-31',
          balance: 100,
        },
      ];

      const result = parseAndSortBalances(balances);

      expect(result).toHaveLength(1);
      expect(result[0].date).toEqual(new Date('2024-01-31'));
      expect(result[0].balance).toBe(100);
    });
  });
});
