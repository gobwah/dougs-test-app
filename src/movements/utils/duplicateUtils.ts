import { Movement } from './parsingUtils';
import { ValidationReason, ValidationReasonType } from '../dto/responseDto';

export interface DuplicateMovement {
  id: number;
  date: string;
  amount: number;
  label: string;
  duplicateType: 'exact' | 'similar';
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
    .replaceAll(/\s+/g, ' ') // Replace one or more consecutive spaces with a single space
    .replaceAll(/[^\w\s]/g, ''); // Remove all non-alphanumeric characters (punctuation, symbols, etc.)
}

/**
 * Calculate Levenshtein distance between two strings
 * Time complexity: O(m * n) where m and n are the lengths of the strings
 * Space complexity: O(m * n) for the matrix
 */
function levenshteinDistance(str1: string, str2: string): number {
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
function calculateSimilarity(str1: string, str2: string): number {
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
 * Create a grouping key from a movement (date + amount)
 * Time complexity: O(1)
 * Space complexity: O(1)
 */
function createMovementKey(movement: Movement): string {
  const dateKey = movement.date.toISOString().split('T')[0];
  return `${dateKey}_${movement.amount}`;
}

/**
 * Convert a Movement to a DuplicateMovement
 * Time complexity: O(1)
 * Space complexity: O(1)
 */
function toDuplicateMovement(
  movement: Movement,
  duplicateType: 'exact' | 'similar',
): DuplicateMovement {
  return {
    id: movement.id,
    date: movement.date.toISOString(),
    amount: movement.amount,
    label: movement.label,
    duplicateType,
  };
}

/**
 * Group movements by date and amount, and normalize labels
 * Time complexity: O(n * m) where n is the number of movements and m is average label length
 * Space complexity: O(n) for the map
 */
function groupMovementsByDateAndAmount(
  movements: Movement[],
): Map<string, Array<{ movement: Movement; normalizedLabel: string }>> {
  const potentialDuplicates = new Map<
    string,
    Array<{ movement: Movement; normalizedLabel: string }>
  >();

  movements.forEach((movement) => {
    const key = createMovementKey(movement);
    const normalizedLabel = normalizeLabel(movement.label);

    const group = potentialDuplicates.get(key) ?? [];
    group.push({ movement, normalizedLabel });
    potentialDuplicates.set(key, group);
  });

  return potentialDuplicates;
}

/**
 * Add duplicates for movements with identical normalized labels
 * Time complexity: O(k) for a label group of size k
 * Space complexity: O(1)
 */
function addExactLabelDuplicates(
  labelGroup: Array<{ movement: Movement; normalizedLabel: string }>,
  duplicates: Map<number, DuplicateMovement>,
): void {
  if (labelGroup.length <= 1) {
    return;
  }

  labelGroup.forEach((item) => {
    const dup = toDuplicateMovement(item.movement, 'exact');
    duplicates.set(dup.id, dup);
  });
}

/**
 * Add duplicates for movements with similar normalized labels
 * Time complexity: O(k₁ * k₂) where k₁ and k₂ are the sizes of the two groups
 * Space complexity: O(1)
 */
function addSimilarLabelDuplicates(
  group1: Array<{ movement: Movement; normalizedLabel: string }>,
  group2: Array<{ movement: Movement; normalizedLabel: string }>,
  duplicates: Map<number, DuplicateMovement>,
): void {
  group1.forEach((item1) => {
    group2.forEach((item2) => {
      const dup1 = toDuplicateMovement(item1.movement, 'similar');
      const dup2 = toDuplicateMovement(item2.movement, 'similar');
      // If movement already exists as 'exact', keep 'exact' (more certain)
      if (!duplicates.has(dup1.id)) {
        duplicates.set(dup1.id, dup1);
      }
      if (!duplicates.has(dup2.id)) {
        duplicates.set(dup2.id, dup2);
      }
    });
  });
}

/**
 * Group movements by exact normalized label
 * Time complexity: O(k) for a group of size k
 * Space complexity: O(k)
 */
function groupByExactLabel(
  group: Array<{ movement: Movement; normalizedLabel: string }>,
): Map<string, Array<{ movement: Movement; normalizedLabel: string }>> {
  const labelGroups = new Map<string, typeof group>();
  group.forEach((item) => {
    const labelKey = item.normalizedLabel;
    const labelGroup = labelGroups.get(labelKey) ?? [];
    labelGroup.push(item);
    labelGroups.set(labelKey, labelGroup);
  });
  return labelGroups;
}

/**
 * Find duplicates between similar label groups
 * Time complexity: O(k'² * m) where k' is the number of unique labels
 * Space complexity: O(1)
 */
function findSimilarLabelDuplicates(
  labelGroups: Map<
    string,
    Array<{ movement: Movement; normalizedLabel: string }>
  >,
  duplicates: Map<number, DuplicateMovement>,
): void {
  const uniqueLabels = Array.from(labelGroups.keys());

  for (let i = 0; i < uniqueLabels.length; i++) {
    for (let j = i + 1; j < uniqueLabels.length; j++) {
      if (areLabelsSimilar(uniqueLabels[i], uniqueLabels[j])) {
        const group1 = labelGroups.get(uniqueLabels[i]);
        const group2 = labelGroups.get(uniqueLabels[j]);

        if (group1 && group2) {
          addSimilarLabelDuplicates(group1, group2, duplicates);
        }
      }
    }
  }
}

/**
 * Find duplicate movements within groups
 * Time complexity: O(k + k'² * m) for each group of size k, where k' is the number of unique labels
 * Space complexity: O(d) where d is the number of unique duplicate movements
 */
function findDuplicatesInGroups(
  potentialDuplicates: Map<
    string,
    Array<{ movement: Movement; normalizedLabel: string }>
  >,
): Map<number, DuplicateMovement> {
  const duplicates = new Map<number, DuplicateMovement>();

  for (const group of potentialDuplicates.values()) {
    if (group.length <= 1) {
      continue;
    }

    const labelGroups = groupByExactLabel(group);

    labelGroups.forEach((labelGroup) => {
      addExactLabelDuplicates(labelGroup, duplicates);
    });

    findSimilarLabelDuplicates(labelGroups, duplicates);
  }

  return duplicates;
}

/**
 * Detect duplicate movements
 * Time complexity: O(n * m + Σ(k + k'² * m)) where:
 *   - n = number of movements, m = average label length
 *   - O(n * m) for grouping by date+amount and normalizing labels
 *   - O(k) for grouping by exact label in each group of size k
 *   - O(k'² * m) for comparing unique labels (k' << k typically)
 *   - In worst case (all different labels): O(n² * m)
 *   - In best case (many identical labels): O(n * m)
 * Space complexity: O(n) for the maps and duplicate arrays
 */
export function detectDuplicates(movements: Movement[]): DuplicateMovement[] {
  const potentialDuplicates = groupMovementsByDateAndAmount(movements);
  const duplicatesMap = findDuplicatesInGroups(potentialDuplicates);
  return Array.from(duplicatesMap.values());
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
