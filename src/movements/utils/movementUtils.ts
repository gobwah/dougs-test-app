import { Movement } from './parsingUtils';

/**
 * Filter movements up to a specific date (inclusive)
 * Time complexity: O(n) where n is the number of movements
 * Space complexity: O(k) where k is the number of filtered movements
 */
export function filterMovementsUpToDate(
  movements: Movement[],
  date: Date,
): Movement[] {
  return movements.filter((m) => m.date <= date);
}

/**
 * Filter movements between two dates (exclusive start, inclusive end)
 * Time complexity: O(n) where n is the number of movements
 * Space complexity: O(k) where k is the number of filtered movements
 */
export function filterMovementsBetweenDates(
  movements: Movement[],
  startDate: Date,
  endDate: Date,
): Movement[] {
  return movements.filter((m) => m.date > startDate && m.date <= endDate);
}

/**
 * Calculate the sum of movement amounts
 * Time complexity: O(n) where n is the number of movements
 * Space complexity: O(1)
 */
export function sumMovementAmounts(movements: Movement[]): number {
  return movements.reduce((sum, m) => sum + m.amount, 0);
}
