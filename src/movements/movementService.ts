import { Injectable } from '@nestjs/common';
import { ValidationRequestDto } from './dto/requestDto';
import {
  ValidationFailureResponse,
  ValidationReason,
  ValidationSuccessResponse,
} from './dto/responseDto';
import {
  parseAndSortMovements,
  parseAndSortBalances,
} from './utils/parsingUtils';
import { validateDateOrder } from './utils/balanceUtils';
import { detectAndReportDuplicates } from './utils/duplicateUtils';
import { validateBalances } from './utils/validationUtils';

@Injectable()
export class MovementService {
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
    validateDateOrder(balances, reasons);

    // Detect duplicates
    detectAndReportDuplicates(movements, reasons);

    // Validate balances
    validateBalances(balances, movements, reasons);

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
