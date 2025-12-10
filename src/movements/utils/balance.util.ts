import { ValidationReason, ValidationReasonType } from '../dto/response.dto';
import { Balance } from './parsing.util';

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
