import { Injectable } from '@nestjs/common';
import { ValidationRequestDto } from './dto/validation-request.dto';
import {
  ValidationFailureResponse,
  ValidationReason,
  ValidationReasonType,
  ValidationSuccessResponse,
} from './dto/validation-response.dto';
import {
  parseAndSortMovements,
  parseAndSortBalances,
  validateBalanceDateOrder,
} from './utils/movementParsing';
import { detectDuplicates } from './utils/duplicateDetection';
import {
  validateFirstBalance,
  validateSubsequentBalances,
  checkMovementsAfterLastBalance,
} from './utils/balanceValidation';

@Injectable()
export class MovementsService {
  /**
   * Validate movements against balance control points
   * Time complexity: O(n log n + m log m + n² * l + b * n) where:
   *   - n = number of movements
   *   - m = number of balances
   *   - b = number of balance points
   *   - l = average label length
   * Space complexity: O(n + m) for parsed and sorted arrays
   */
  validateMovements(
    request: ValidationRequestDto,
  ): ValidationSuccessResponse | ValidationFailureResponse {
    const reasons: ValidationReason[] = [];

    // Parse and sort movements by date
    const movements = parseAndSortMovements(request.movements);

    // Parse and sort balances by date
    const balances = parseAndSortBalances(request.balances);

    // Validate date order
    if (balances.length > 0 && !validateBalanceDateOrder(balances)) {
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

    // Detect duplicates
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

    // Validate balances
    if (balances.length > 0 && movements.length > 0) {
      // Validate first balance point
      const firstBalanceError = validateFirstBalance(balances[0], movements);
      if (firstBalanceError) {
        reasons.push(firstBalanceError);
      }

      // Validate subsequent balance points
      const subsequentErrors = validateSubsequentBalances(balances, movements);
      reasons.push(...subsequentErrors);

      // Check for movements after the last balance point
      const missingTransactionError = checkMovementsAfterLastBalance(
        balances,
        movements,
      );
      if (missingTransactionError) {
        reasons.push(missingTransactionError);
      }

      // Note: Movements before the first balance point are acceptable
      // as long as the first balance correctly accounts for them (which is validated above)
    } else if (balances.length === 0) {
      reasons.push({
        type: ValidationReasonType.BALANCE_MISMATCH,
        message: 'No balance control points provided',
        details: {},
      });
    }

    if (reasons.length > 0) {
      return {
        message: 'Validation failed',
        reasons,
      };
    }

    return {
      message: 'Accepted',
    };
  }
}
