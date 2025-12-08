import { ValidationReason, ValidationReasonType } from '../dto/responseDto';
import { Balance } from './parsingUtils';

/**
 * Validate that balances are in chronological order
 * Time complexity: O(n) where n is the number of balances
 * Space complexity: O(1)
 */
export function validateBalanceDateOrder(balances: Balance[]): boolean {
  for (let i = 1; i < balances.length; i++) {
    if (balances[i].date <= balances[i - 1].date) {
      return false;
    }
  }
  return true;
}

/**
 * Validate date order and add reasons to the array if invalid
 * Time complexity: O(n) where n is the number of balances
 * Space complexity: O(1)
 */
export function validateDateOrder(
  balances: Balance[],
  reasons: ValidationReason[],
): void {
  if (balances.length === 0) {
    return;
  }

  if (validateBalanceDateOrder(balances)) {
    return;
  }

  for (let i = 1; i < balances.length; i++) {
    if (balances[i].date <= balances[i - 1].date) {
      reasons.push({
        type: ValidationReasonType.INVALID_DATE_ORDER,
        message: 'Balance control points must be in chronological order',
        details: {
          balanceDate: balances[i].date.toISOString(),
        },
      });
    }
  }
}
