import { Injectable } from '@nestjs/common';
import { ValidationRequestDto } from './dto/request.dto';
import {
  ValidationFailureResponse,
  ValidationReason,
  ValidationSuccessResponse,
} from './dto/response.dto';
import {
  parseAndSortMovements,
  parseAndSortBalances,
} from './utils/parsing.util';
import { DuplicateService } from '../duplicates/duplicate.service';
import { BalanceService } from '../balances/balance.service';

@Injectable()
export class MovementService {
  constructor(
    private readonly duplicateService: DuplicateService,
    private readonly balanceService: BalanceService,
  ) {}
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

    const movements = parseAndSortMovements(request.movements);
    const balances = parseAndSortBalances(request.balances);

    this.balanceService.validateDateOrder(balances, reasons);
    this.duplicateService.detectAndReportDuplicates(movements, reasons);
    this.balanceService.validateBalances(balances, movements, reasons);

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
