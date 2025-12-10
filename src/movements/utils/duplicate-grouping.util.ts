import { Movement } from './parsing.util';
import { normalizeLabel } from './label-similarity.util';
import { DuplicateMovement } from './duplicate-detection.util';

/**
 * Create a grouping key from a movement (date + amount)
 * Time complexity: O(1)
 * Space complexity: O(1)
 */
export function createMovementKey(movement: Movement): string {
  const dateKey = movement.date.toISOString().split('T')[0];
  return `${dateKey}_${movement.amount}`;
}

/**
 * Convert a Movement to a DuplicateMovement
 * Time complexity: O(1)
 * Space complexity: O(1)
 */
export function toDuplicateMovement(
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
export function groupMovementsByDateAndAmount(
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
 * Group movements by exact normalized label
 * Time complexity: O(k) for a group of size k
 * Space complexity: O(k)
 */
export function groupByExactLabel(
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
 * Group labels by length for efficient comparison
 * Labels of similar lengths are grouped together to reduce comparisons
 * Time complexity: O(k') where k' is the number of unique labels
 * Space complexity: O(k')
 */
export function groupLabelsByLength(
  uniqueLabels: string[],
): Map<number, string[]> {
  const lengthGroups = new Map<number, string[]>();
  uniqueLabels.forEach((label) => {
    const length = label.length;
    const group = lengthGroups.get(length) ?? [];
    group.push(label);
    lengthGroups.set(length, group);
  });
  return lengthGroups;
}
