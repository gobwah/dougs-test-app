import {
  filterMovementsUpToDate,
  filterMovementsBetweenDates,
  sumMovementAmounts,
} from '../../../src/movements/utils/movementUtils';
import { Movement } from '../../../src/movements/utils/parsingUtils';

describe('MovementUtils', () => {
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
        {
          id: 2,
          date: new Date('2024-01-10'),
          label: 'Transaction 2',
          amount: -50,
        },
      ];

      const result = filterMovementsUpToDate(movements, new Date('2024-01-20'));

      expect(result).toHaveLength(2);
    });

    it('should handle empty array', () => {
      const result = filterMovementsUpToDate([], new Date('2024-01-10'));

      expect(result).toHaveLength(0);
    });

    it('should include movements exactly on the date', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-10T10:00:00'),
          label: 'Transaction 1',
          amount: 100,
        },
        {
          id: 2,
          date: new Date('2024-01-10T15:00:00'),
          label: 'Transaction 2',
          amount: -50,
        },
      ];

      const result = filterMovementsUpToDate(
        movements,
        new Date('2024-01-10T12:00:00'),
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
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
          amount: 75,
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
        new Date('2024-01-10'),
        new Date('2024-01-20'),
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
    });

    it('should include movements on end date', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-15'),
          label: 'Transaction 1',
          amount: 100,
        },
        {
          id: 2,
          date: new Date('2024-01-20'),
          label: 'Transaction 2',
          amount: -50,
        },
      ];

      const result = filterMovementsBetweenDates(
        movements,
        new Date('2024-01-10'),
        new Date('2024-01-20'),
      );

      expect(result).toHaveLength(2);
    });

    it('should return empty array if no movements in range', () => {
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
        new Date('2024-01-20'),
      );

      expect(result).toHaveLength(0);
    });

    it('should handle empty array', () => {
      const result = filterMovementsBetweenDates(
        [],
        new Date('2024-01-10'),
        new Date('2024-01-20'),
      );

      expect(result).toHaveLength(0);
    });
  });

  describe('sumMovementAmounts', () => {
    it('should sum all movement amounts', () => {
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
          date: new Date('2024-01-05'),
          label: 'Transaction 1',
          amount: -100,
        },
        {
          id: 2,
          date: new Date('2024-01-10'),
          label: 'Transaction 2',
          amount: -50,
        },
      ];

      const result = sumMovementAmounts(movements);

      expect(result).toBe(-150);
    });

    it('should handle single movement', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-05'),
          label: 'Transaction 1',
          amount: 100,
        },
      ];

      const result = sumMovementAmounts(movements);

      expect(result).toBe(100);
    });

    it('should handle decimal amounts', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-05'),
          label: 'Transaction 1',
          amount: 10.5,
        },
        {
          id: 2,
          date: new Date('2024-01-10'),
          label: 'Transaction 2',
          amount: 20.25,
        },
      ];

      const result = sumMovementAmounts(movements);

      expect(result).toBe(30.75);
    });
  });
});
