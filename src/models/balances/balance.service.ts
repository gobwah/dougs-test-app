import { Injectable } from '@nestjs/common';
import {
  ValidationReason,
  ValidationReasonType,
} from '../movements/dto/response.dto';
import { Balance } from './entities/balance.entity';
import { Movement } from '../movements/entities/movement.entity';
import {
  validateFirstBalance,
  validateSubsequentBalances,
  checkMovementsAfterLastBalance,
} from './utils/balance.util';

@Injectable()
export class BalanceService {
  /**
   * Validate date order and add reasons to the array if invalid
   * Time complexity: O(n) where n is the number of balances
   * Space complexity: O(1)
   */
  validateDateOrder(balances: Balance[], reasons: ValidationReason[]): void {
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

  /**
   * Validate all balances and add reasons to the array if invalid
   * Time complexity: O(b * n) where b is the number of balance points and n is the number of movements
   * Space complexity: O(n) in worst case for filtered movements
   */
  validateBalances(
    balances: Balance[],
    movements: Movement[],
    reasons: ValidationReason[],
  ): void {
    if (balances.length === 0) {
      reasons.push({
        type: ValidationReasonType.BALANCE_MISMATCH,
        message: 'No balance control points provided',
        details: {},
      });
      return;
    }

    if (movements.length === 0) {
      return;
    }

    const firstBalanceError = validateFirstBalance(balances[0], movements);
    if (firstBalanceError) {
      reasons.push(firstBalanceError);
    }

    const subsequentErrors = validateSubsequentBalances(balances, movements);
    reasons.push(...subsequentErrors);

    const missingTransactionError = checkMovementsAfterLastBalance(
      balances,
      movements,
    );
    if (missingTransactionError) {
      reasons.push(missingTransactionError);
    }
  }
}
