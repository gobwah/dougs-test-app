import {
  normalizeLabel,
  levenshteinDistance,
  calculateSimilarity,
  areLabelsSimilar,
  detectDuplicates,
} from '../../../src/movements/utils/duplicate-detection.utils';
import { Movement } from '../../../src/movements/utils/movement-parsing.utils';

describe('DuplicateDetectionUtils', () => {
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

  describe('levenshteinDistance', () => {
    it('should return 0 for identical strings', () => {
      expect(levenshteinDistance('abc', 'abc')).toBe(0);
    });

    it('should return length for completely different strings', () => {
      expect(levenshteinDistance('abc', 'xyz')).toBe(3);
    });

    it('should return 1 for one character difference', () => {
      expect(levenshteinDistance('abc', 'abd')).toBe(1);
    });

    it('should handle empty strings', () => {
      expect(levenshteinDistance('', '')).toBe(0);
      expect(levenshteinDistance('abc', '')).toBe(3);
      expect(levenshteinDistance('', 'abc')).toBe(3);
    });

    it('should handle strings of different lengths', () => {
      expect(levenshteinDistance('abc', 'abcd')).toBe(1);
      expect(levenshteinDistance('abcd', 'abc')).toBe(1);
    });

    it('should calculate distance correctly for complex cases', () => {
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
      expect(levenshteinDistance('saturday', 'sunday')).toBe(3);
    });
  });

  describe('calculateSimilarity', () => {
    it('should return 1 for identical strings', () => {
      expect(calculateSimilarity('abc', 'abc')).toBe(1);
    });

    it('should return 0 for completely different strings', () => {
      expect(calculateSimilarity('abc', 'xyz')).toBe(0);
    });

    it('should return high similarity for similar strings', () => {
      const similarity = calculateSimilarity('payment', 'paymnt');
      expect(similarity).toBeGreaterThan(0.7);
    });

    it('should handle empty strings', () => {
      expect(calculateSimilarity('', '')).toBe(1);
      expect(calculateSimilarity('abc', '')).toBe(0);
      expect(calculateSimilarity('', 'abc')).toBe(0);
    });

    it('should return similarity between 0 and 1', () => {
      const similarity = calculateSimilarity('payment', 'paymnt');
      expect(similarity).toBeGreaterThanOrEqual(0);
      expect(similarity).toBeLessThanOrEqual(1);
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

    it('should handle normalized labels', () => {
      // areLabelsSimilar expects normalized labels, so we need to normalize first
      const label1 = normalizeLabel('PAYMENT');
      const label2 = normalizeLabel('payment');
      expect(areLabelsSimilar(label1, label2)).toBe(true);
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
  });
});
