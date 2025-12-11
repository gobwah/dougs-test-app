import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(BalanceService.name);
  /**
   * Validate date order and add reasons to the array if invalid
   * Time complexity: O(n) where n is the number of balances
   * Space complexity: O(1)
   */
  validateDateOrder(balances: Balance[], reasons: ValidationReason[]): void {
    if (balances.length === 0) {
      this.logger.debug('No balances to validate date order');
      return;
    }

    this.logger.debug(
      `Validating date order for ${balances.length} balance points`,
    );
    for (let i = 1; i < balances.length; i++) {
      if (balances[i].date <= balances[i - 1].date) {
        this.logger.warn(
          `Invalid date order detected: balance at ${balances[i].date.toISOString()} is not after ${balances[i - 1].date.toISOString()}`,
        );
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
      this.logger.warn('No balance control points provided');
      reasons.push({
        type: ValidationReasonType.BALANCE_MISMATCH,
        message: 'No balance control points provided',
        details: {},
      });
      return;
    }

    if (movements.length === 0) {
      this.logger.debug('No movements to validate against balances');
      return;
    }

    this.logger.debug(
      `Validating ${balances.length} balance points against ${movements.length} movements`,
    );

    const firstBalanceError = validateFirstBalance(balances[0], movements);
    if (firstBalanceError) {
      this.logger.warn(
        `First balance mismatch: expected ${firstBalanceError.details.expectedBalance}, actual ${firstBalanceError.details.actualBalance}`,
      );
      reasons.push(firstBalanceError);
    }

    const subsequentErrors = validateSubsequentBalances(balances, movements);
    if (subsequentErrors.length > 0) {
      this.logger.warn(
        `Found ${subsequentErrors.length} subsequent balance error(s)`,
      );
    }
    reasons.push(...subsequentErrors);

    const missingTransactionError = checkMovementsAfterLastBalance(
      balances,
      movements,
    );
    if (missingTransactionError) {
      this.logger.warn('Movements detected after last balance point');
      reasons.push(missingTransactionError);
    }
  }
}
