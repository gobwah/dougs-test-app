import {
  normalizeLabel,
  areLabelsSimilar,
  detectDuplicates,
} from '../../../src/movements/utils/duplicateUtils';
import { Movement } from '../../../src/movements/utils/parsingUtils';

describe('DuplicateUtils', () => {
  describe('normalizeLabel', () => {
    it('should convert to lowercase', () => {
      expect(normalizeLabel('PAYMENT')).toBe('payment');
    });

    it('should trim whitespace', () => {
      expect(normalizeLabel('  PAYMENT  ')).toBe('payment');
    });

    it('should normalize multiple spaces', () => {
      expect(normalizeLabel('PAYMENT    REF')).toBe('payment ref');
    });

    it('should remove special characters', () => {
      expect(normalizeLabel('PAYMENT #123!@#$%')).toBe('payment 123');
    });

    it('should handle empty string', () => {
      expect(normalizeLabel('')).toBe('');
    });

    it('should handle string with only special characters', () => {
      expect(normalizeLabel('!@#$%')).toBe('');
    });

    it('should handle mixed case and special characters', () => {
      expect(normalizeLabel('  Payment #123!@#$%  ')).toBe('payment 123');
    });
  });

  describe('areLabelsSimilar', () => {
    it('should return true for identical labels', () => {
      expect(areLabelsSimilar('payment', 'payment')).toBe(true);
    });

    it('should return true when one label contains the other', () => {
      expect(areLabelsSimilar('payment', 'payment ref 123')).toBe(true);
      expect(areLabelsSimilar('payment ref 123', 'payment')).toBe(true);
    });

    it('should return true for high similarity (>80%)', () => {
      expect(areLabelsSimilar('payment', 'paymnt')).toBe(true);
    });

    it('should return false for low similarity (<80%)', () => {
      expect(areLabelsSimilar('payment', 'withdrawal')).toBe(false);
    });

    it('should return false quickly for labels with very different lengths', () => {
      // These labels cannot be 80% similar due to length difference
      // "xyz" (3 chars) vs "abcdefghijklmnopqrstuvw" (22 chars)
      // 3 / 22 = 0.136 < 0.8, so they cannot be similar
      // Note: They don't contain each other, so we test the length filter
      expect(areLabelsSimilar('xyz', 'abcdefghijklmnopqrstuvw')).toBe(false);
      expect(areLabelsSimilar('abcdefghijklmnopqrstuvw', 'xyz')).toBe(false);
    });

    it('should handle normalized labels', () => {
      // areLabelsSimilar expects normalized labels, so we need to normalize first
      const label1 = normalizeLabel('PAYMENT');
      const label2 = normalizeLabel('payment');
      expect(areLabelsSimilar(label1, label2)).toBe(true);
    });

    it('should handle empty strings', () => {
      expect(areLabelsSimilar('', '')).toBe(true);
    });
  });

  describe('detectDuplicates', () => {
    it('should detect exact duplicates (same date, amount, label)', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-01'),
          label: 'Payment ABC',
          amount: 100,
        },
        {
          id: 2,
          date: new Date('2024-01-01'),
          label: 'Payment ABC',
          amount: 100,
        },
      ];

      const duplicates = detectDuplicates(movements);

      expect(duplicates).toHaveLength(2);
      expect(duplicates.map((d) => d.id)).toContain(1);
      expect(duplicates.map((d) => d.id)).toContain(2);
      duplicates.forEach((dup) => {
        expect(dup.duplicateType).toBe('exact');
      });
    });

    it('should detect duplicates with similar labels using Levenshtein', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-01'),
          label: 'PAYMENT ABC',
          amount: 100,
        },
        {
          id: 2,
          date: new Date('2024-01-01'),
          label: 'PAYMENT ABD', // Similar (1 char difference)
          amount: 100,
        },
      ];

      const duplicates = detectDuplicates(movements);

      expect(duplicates.length).toBeGreaterThanOrEqual(2);
      expect(duplicates.map((d) => d.id)).toContain(1);
      expect(duplicates.map((d) => d.id)).toContain(2);
      duplicates.forEach((dup) => {
        expect(dup.duplicateType).toBe('similar');
      });
    });

    it('should detect duplicates when one label contains the other', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-01'),
          label: 'PAYMENT',
          amount: 100,
        },
        {
          id: 2,
          date: new Date('2024-01-01'),
          label: 'PAYMENT REF 12345',
          amount: 100,
        },
      ];

      const duplicates = detectDuplicates(movements);

      expect(duplicates.length).toBeGreaterThanOrEqual(2);
      expect(duplicates.map((d) => d.id)).toContain(1);
      expect(duplicates.map((d) => d.id)).toContain(2);
      duplicates.forEach((dup) => {
        expect(dup.duplicateType).toBe('similar');
      });
    });

    it('should not detect duplicates when labels are different enough', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-01'),
          label: 'PAYMENT ABC',
          amount: 100,
        },
        {
          id: 2,
          date: new Date('2024-01-01'),
          label: 'WITHDRAWAL XYZ',
          amount: 100,
        },
      ];

      const duplicates = detectDuplicates(movements);

      expect(duplicates).toHaveLength(0);
    });

    it('should not detect duplicates when dates are different', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-01'),
          label: 'Payment ABC',
          amount: 100,
        },
        {
          id: 2,
          date: new Date('2024-01-02'),
          label: 'Payment ABC',
          amount: 100,
        },
      ];

      const duplicates = detectDuplicates(movements);

      expect(duplicates).toHaveLength(0);
    });

    it('should not detect duplicates when amounts are different', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-01'),
          label: 'Payment ABC',
          amount: 100,
        },
        {
          id: 2,
          date: new Date('2024-01-01'),
          label: 'Payment ABC',
          amount: 200,
        },
      ];

      const duplicates = detectDuplicates(movements);

      expect(duplicates).toHaveLength(0);
    });

    it('should handle special characters in labels', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-01'),
          label: 'PAYMENT #123!@#$%',
          amount: 100,
        },
        {
          id: 2,
          date: new Date('2024-01-01'),
          label: 'PAYMENT 123',
          amount: 100,
        },
      ];

      const duplicates = detectDuplicates(movements);

      expect(duplicates.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle empty array', () => {
      const duplicates = detectDuplicates([]);
      expect(duplicates).toHaveLength(0);
    });

    it('should handle single movement', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-01'),
          label: 'Payment ABC',
          amount: 100,
        },
      ];

      const duplicates = detectDuplicates(movements);
      expect(duplicates).toHaveLength(0);
    });

    it('should remove duplicate entries from result (same transaction appears multiple times)', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-01'),
          label: 'Payment ABC',
          amount: 100,
        },
        {
          id: 2,
          date: new Date('2024-01-01'),
          label: 'Payment ABC',
          amount: 100,
        },
        {
          id: 3,
          date: new Date('2024-01-01'),
          label: 'Payment ABC',
          amount: 100,
        },
      ];

      const duplicates = detectDuplicates(movements);

      // Should have unique duplicates (no duplicate IDs in result)
      const duplicateIds = duplicates.map((d) => d.id);
      const uniqueIds = new Set(duplicateIds);
      expect(duplicateIds.length).toBe(uniqueIds.size);
    });

    it('should handle multiple groups of duplicates', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-01'),
          label: 'Payment ABC',
          amount: 100,
        },
        {
          id: 2,
          date: new Date('2024-01-01'),
          label: 'Payment ABC',
          amount: 100,
        },
        {
          id: 3,
          date: new Date('2024-01-02'),
          label: 'Withdrawal XYZ',
          amount: 50,
        },
        {
          id: 4,
          date: new Date('2024-01-02'),
          label: 'Withdrawal XYZ',
          amount: 50,
        },
      ];

      const duplicates = detectDuplicates(movements);

      expect(duplicates.length).toBeGreaterThanOrEqual(4);
      expect(duplicates.map((d) => d.id)).toContain(1);
      expect(duplicates.map((d) => d.id)).toContain(2);
      expect(duplicates.map((d) => d.id)).toContain(3);
      expect(duplicates.map((d) => d.id)).toContain(4);
    });

    it('should mark exact duplicates with duplicateType "exact"', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-01'),
          label: 'PAYMENT ABC',
          amount: 100,
        },
        {
          id: 2,
          date: new Date('2024-01-01'),
          label: 'Payment ABC', // Same after normalization
          amount: 100,
        },
        {
          id: 3,
          date: new Date('2024-01-01'),
          label: 'payment abc', // Same after normalization
          amount: 100,
        },
      ];

      const duplicates = detectDuplicates(movements);

      expect(duplicates).toHaveLength(3);
      duplicates.forEach((dup) => {
        expect(dup.duplicateType).toBe('exact');
      });
    });

    it('should mark similar duplicates with duplicateType "similar"', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-01'),
          label: 'PAYMENT',
          amount: 100,
        },
        {
          id: 2,
          date: new Date('2024-01-01'),
          label: 'PAYMNT', // Similar but not exact
          amount: 100,
        },
      ];

      const duplicates = detectDuplicates(movements);

      expect(duplicates).toHaveLength(2);
      duplicates.forEach((dup) => {
        expect(dup.duplicateType).toBe('similar');
      });
    });

    it('should prioritize "exact" over "similar" when a movement is both', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-01'),
          label: 'PAYMENT ABC',
          amount: 100,
        },
        {
          id: 2,
          date: new Date('2024-01-01'),
          label: 'Payment ABC', // Exact match with id:1
          amount: 100,
        },
        {
          id: 3,
          date: new Date('2024-01-01'),
          label: 'PAYMENT ABD', // Similar to id:1 and id:2
          amount: 100,
        },
      ];

      const duplicates = detectDuplicates(movements);

      expect(duplicates).toHaveLength(3);
      const duplicate1 = duplicates.find((d) => d.id === 1);
      const duplicate2 = duplicates.find((d) => d.id === 2);
      const duplicate3 = duplicates.find((d) => d.id === 3);

      // id:1 and id:2 are exact duplicates, so they should be 'exact'
      expect(duplicate1?.duplicateType).toBe('exact');
      expect(duplicate2?.duplicateType).toBe('exact');
      // id:3 is only similar, so it should be 'similar'
      expect(duplicate3?.duplicateType).toBe('similar');
    });

    it('should handle mixed exact and similar duplicates in different groups', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-01'),
          label: 'PAYMENT ABC',
          amount: 100,
        },
        {
          id: 2,
          date: new Date('2024-01-01'),
          label: 'Payment ABC', // Exact with id:1
          amount: 100,
        },
        {
          id: 3,
          date: new Date('2024-01-02'),
          label: 'WITHDRAWAL',
          amount: 50,
        },
        {
          id: 4,
          date: new Date('2024-01-02'),
          label: 'WITHDRAW', // Similar to id:3
          amount: 50,
        },
      ];

      const duplicates = detectDuplicates(movements);

      expect(duplicates.length).toBeGreaterThanOrEqual(4);
      const exactDuplicates = duplicates.filter(
        (d) => d.duplicateType === 'exact',
      );
      const similarDuplicates = duplicates.filter(
        (d) => d.duplicateType === 'similar',
      );

      // Should have exact duplicates (id:1 and id:2)
      expect(exactDuplicates.length).toBeGreaterThanOrEqual(2);
      expect(exactDuplicates.map((d) => d.id)).toContain(1);
      expect(exactDuplicates.map((d) => d.id)).toContain(2);

      // Should have similar duplicates (id:3 and id:4)
      expect(similarDuplicates.length).toBeGreaterThanOrEqual(2);
      expect(similarDuplicates.map((d) => d.id)).toContain(3);
      expect(similarDuplicates.map((d) => d.id)).toContain(4);
    });
  });
});
