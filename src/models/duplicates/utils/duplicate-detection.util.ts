import { Movement } from '../../movements/entities/movement.entity';
import {
  ValidationReason,
  ValidationReasonType,
} from '../../movements/dto/response.dto';
import { DuplicateMovement } from '../entities/duplicate.entity';
import { areLabelsSimilar } from './label-similarity.util';
import {
  groupMovementsByDateAndAmount,
  groupByExactLabel,
  groupLabelsByLength,
  toDuplicateMovement,
} from './duplicate-grouping.util';

/**
 * Add duplicates for movements with identical normalized labels
 * Time complexity: O(k) for a label group of size k
 * Space complexity: O(1)
 */
export function addExactLabelDuplicates(
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
export function addSimilarLabelDuplicates(
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
 * Find duplicates between similar label groups
 * Optimized: Groups labels by length and uses cache to avoid duplicate calculations
 * Time complexity: O(Σ(kᵢ² * m) + Σ(kᵢ * kⱼ)) where:
 *   - kᵢ is the number of labels of length i
 *   - First term: comparisons within same length (with Levenshtein, cached)
 *   - Second term: comparisons between different lengths (includes check only, O(1))
 *   This is typically much better than O(k'² * m) when labels have varied lengths
 * Space complexity: O(k'²) for the similarity cache (worst case)
 */
export function findSimilarLabelDuplicates(
  labelGroups: Map<
    string,
    Array<{ movement: Movement; normalizedLabel: string }>
  >,
  duplicates: Map<number, DuplicateMovement>,
): void {
  const uniqueLabels = Array.from(labelGroups.keys());
  const lengthGroups = groupLabelsByLength(uniqueLabels);
  const lengths = Array.from(lengthGroups.keys()).sort((a, b) => a - b);

  // Cache for similarity results to avoid recalculating
  const similarityCache = new Map<string, boolean>();

  const getCachedSimilarity = (label1: string, label2: string): boolean => {
    // Create a canonical key (smaller label first for symmetry)
    const key = label1 < label2 ? `${label1}|${label2}` : `${label2}|${label1}`;
    const cached = similarityCache.get(key);
    if (cached !== undefined) {
      return cached;
    }
    const result = areLabelsSimilar(label1, label2);
    similarityCache.set(key, result);
    return result;
  };

  // Compare labels within the same length group
  lengths.forEach((length) => {
    const labels = lengthGroups.get(length);
    if (!labels) {
      return;
    }
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        if (getCachedSimilarity(labels[i], labels[j])) {
          const group1 = labelGroups.get(labels[i]);
          const group2 = labelGroups.get(labels[j]);
          if (group1 && group2) {
            addSimilarLabelDuplicates(group1, group2, duplicates);
          }
        }
      }
    }
  });

  // Compare labels between different length groups
  // areLabelsSimilar handles the optimization (includes check before Levenshtein)
  for (let i = 0; i < lengths.length; i++) {
    for (let j = i + 1; j < lengths.length; j++) {
      const labels1 = lengthGroups.get(lengths[i]);
      const labels2 = lengthGroups.get(lengths[j]);
      if (!labels1 || !labels2) {
        continue;
      }
      labels1.forEach((label1) => {
        labels2.forEach((label2) => {
          if (getCachedSimilarity(label1, label2)) {
            const group1 = labelGroups.get(label1);
            const group2 = labelGroups.get(label2);
            if (group1 && group2) {
              addSimilarLabelDuplicates(group1, group2, duplicates);
            }
          }
        });
      });
    }
  }
}

/**
 * Find duplicate movements within groups
 * Time complexity: O(k + k'² * m) for each group of size k, where k' is the number of unique labels
 * Space complexity: O(d) where d is the number of unique duplicate movements
 */
export function findDuplicatesInGroups(
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
