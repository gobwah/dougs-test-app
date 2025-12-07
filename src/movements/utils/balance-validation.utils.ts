import {
  ValidationReason,
  ValidationReasonType,
} from '../dto/validation-response.dto';
import { Movement, Balance } from './movement-parsing.utils';

const BALANCE_TOLERANCE = 0.01; // Allow small floating point differences

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

/**
 * Validate the first balance point
 * Time complexity: O(n) where n is the number of movements up to the first balance
 * Space complexity: O(k) where k is the number of movements up to the first balance
 */
export function validateFirstBalance(
  firstBalance: Balance,
  movements: Movement[],
): ValidationReason | null {
  const movementsUpToFirst = filterMovementsUpToDate(
    movements,
    firstBalance.date,
  );

  if (movementsUpToFirst.length === 0) {
    // If no movements up to first point, we trust it as per problem statement
    return null;
  }

  const sumMovementsUpToFirst = sumMovementAmounts(movementsUpToFirst);

  // Assume initial balance = 0 and validate first point
  // Expected balance = 0 + sum of movements up to first point
  const expectedFirstBalance = sumMovementsUpToFirst;
  const difference = Math.abs(expectedFirstBalance - firstBalance.balance);

  if (difference > BALANCE_TOLERANCE) {
    return {
      type: ValidationReasonType.BALANCE_MISMATCH,
      message: `Balance mismatch at first control point ${firstBalance.date.toISOString()}`,
      details: {
        balanceDate: firstBalance.date.toISOString(),
        expectedBalance: expectedFirstBalance,
        actualBalance: firstBalance.balance,
        difference: expectedFirstBalance - firstBalance.balance,
      },
    };
  }

  return null;
}

/**
 * Validate subsequent balance points
 * Time complexity: O(b * n) where b is the number of balance points and n is the number of movements
 *   - O(b) iterations
 *   - O(n) for filtering movements in each iteration
 * Space complexity: O(n) in worst case for filtered movements
 */
export function validateSubsequentBalances(
  balances: Balance[],
  movements: Movement[],
): ValidationReason[] {
  const reasons: ValidationReason[] = [];

  for (let i = 1; i < balances.length; i++) {
    const previousBalance = balances[i - 1];
    const currentBalance = balances[i];

    // Get movements between the two balance points
    const movementsInPeriod = filterMovementsBetweenDates(
      movements,
      previousBalance.date,
      currentBalance.date,
    );
    const sumMovementsInPeriod = sumMovementAmounts(movementsInPeriod);

    // The difference between balances should equal the sum of movements in that period
    const expectedBalance = previousBalance.balance + sumMovementsInPeriod;
    const difference = Math.abs(expectedBalance - currentBalance.balance);

    if (difference > BALANCE_TOLERANCE) {
      reasons.push({
        type: ValidationReasonType.BALANCE_MISMATCH,
        message: `Balance mismatch at control point ${currentBalance.date.toISOString()}`,
        details: {
          balanceDate: currentBalance.date.toISOString(),
          expectedBalance: expectedBalance,
          actualBalance: currentBalance.balance,
          difference: expectedBalance - currentBalance.balance,
        },
      });
    }
  }

  return reasons;
}

/**
 * Check for movements after the last balance point
 * Time complexity: O(n) where n is the number of movements
 * Space complexity: O(k) where k is the number of movements after the last balance
 */
export function checkMovementsAfterLastBalance(
  balances: Balance[],
  movements: Movement[],
): ValidationReason | null {
  if (balances.length === 0) {
    return null;
  }

  const lastBalanceDate = balances.at(-1).date;
  const movementsAfterLastBalance = movements.filter(
    (m) => m.date > lastBalanceDate,
  );

  if (movementsAfterLastBalance.length > 0) {
    const totalAfterLastBalance = sumMovementAmounts(movementsAfterLastBalance);
    return {
      type: ValidationReasonType.MISSING_TRANSACTION,
      message: `There are ${movementsAfterLastBalance.length} movement(s) after the last balance control point. This may indicate missing balance control points or missing transactions.`,
      details: {
        periodStart: lastBalanceDate.toISOString(),
        periodEnd: movements.at(-1).date.toISOString(),
        missingAmount: totalAfterLastBalance,
      },
    };
  }

  return null;
}
