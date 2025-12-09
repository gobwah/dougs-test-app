import { Movement } from './parsingUtils';
import { ValidationReason, ValidationReasonType } from '../dto/responseDto';

export interface DuplicateMovement {
  id: number;
  date: string;
  amount: number;
  label: string;
}

/**
 * Normalize a label for comparison
 * Time complexity: O(n) where n is the length of the label
 * Space complexity: O(n) for the new string
 */
export function normalizeLabel(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replaceAll(/\s+/g, ' ')
    .replaceAll(/[^\w\s]/g, '');
}

/**
 * Calculate Levenshtein distance between two strings
 * Time complexity: O(m * n) where m and n are the lengths of the strings
 * Space complexity: O(m * n) for the matrix
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 * Time complexity: O(m * n) where m and n are the lengths of the strings
 * Space complexity: O(m * n) for the Levenshtein matrix
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1;
  }

  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Check if two labels are similar
 * Time complexity: O(m * n) in worst case (Levenshtein), O(min(m, n)) for contains check
 * Space complexity: O(m * n) in worst case
 */
export function areLabelsSimilar(label1: string, label2: string): boolean {
  if (label1 === label2) {
    return true;
  }

  if (label1.includes(label2) || label2.includes(label1)) {
    return true;
  }

  const similarity = calculateSimilarity(label1, label2);
  return similarity > 0.8; // 80% similarity threshold
}

/**
 * Detect duplicate movements
 * Time complexity: O(n² * m) where n is the number of movements and m is the average label length
 *   - O(n) for grouping by date+amount
 *   - O(k² * m) for each group of size k (comparison of labels)
 *   - In worst case, all movements have same date+amount: O(n² * m)
 * Space complexity: O(n) for the map and duplicate arrays
 */
export function detectDuplicates(movements: Movement[]): DuplicateMovement[] {
  const duplicates: DuplicateMovement[] = [];

  // Group movements by date and amount (same day, same amount could be duplicates)
  // Time: O(n), Space: O(n)
  const potentialDuplicates = new Map<string, Movement[]>();

  for (const movement of movements) {
    const dateKey = movement.date.toISOString().split('T')[0]; // YYYY-MM-DD
    const key = `${dateKey}_${movement.amount}`;

    if (!potentialDuplicates.has(key)) {
      potentialDuplicates.set(key, []);
    }
    potentialDuplicates.get(key)!.push(movement);
  }

  // Check for duplicates: same date, same amount, and similar labels
  // Time: O(k² * m) for each group of size k, where m is label length
  for (const group of potentialDuplicates.values()) {
    if (group.length > 1) {
      // Check if labels are similar (normalized comparison)
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const label1 = normalizeLabel(group[i].label);
          const label2 = normalizeLabel(group[j].label);

          // If labels are similar (same or very close), consider them duplicates
          if (areLabelsSimilar(label1, label2)) {
            duplicates.push(
              {
                id: group[i].id,
                date: group[i].date.toISOString(),
                amount: group[i].amount,
                label: group[i].label,
              },
              {
                id: group[j].id,
                date: group[j].date.toISOString(),
                amount: group[j].amount,
                label: group[j].label,
              },
            );
          }
        }
      }
    }
  }

  // Remove duplicates from the duplicates array (if same transaction appears multiple times)
  // Time: O(d) where d is the number of duplicates, Space: O(d)
  const uniqueDuplicates = Array.from(
    new Map(duplicates.map((d) => [d.id, d])).values(),
  );

  return uniqueDuplicates;
}

/**
 * Detect duplicates and add reasons to the array if found
 * Time complexity: O(n² * m) where n is the number of movements and m is the average label length
 * Space complexity: O(n) for the map and duplicate arrays
 */
export function detectAndReportDuplicates(
  movements: Movement[],
  reasons: ValidationReason[],
): void {
  const duplicates = detectDuplicates(movements);
  if (duplicates.length > 0) {
    reasons.push({
      type: ValidationReasonType.DUPLICATE_TRANSACTION,
      message: `Found ${duplicates.length} duplicate transaction(s)`,
      details: {
        duplicateMovements: duplicates,
      },
    });
  }
}
