import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(MovementService.name);

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
    this.logger.log(
      `Starting validation for ${request.movements.length} movements and ${request.balances.length} balance points`,
    );

    const reasons: ValidationReason[] = [];

    const movements = parseAndSortMovements(request.movements);
    const balances = parseAndSortBalances(request.balances);

    this.logger.debug('Validating date order of balance points');
    this.balanceService.validateDateOrder(balances, reasons);

    this.logger.debug('Detecting duplicate transactions');
    this.duplicateService.detectAndReportDuplicates(movements, reasons);

    this.logger.debug('Validating balances against movements');
    this.balanceService.validateBalances(balances, movements, reasons);

    if (reasons.length > 0) {
      this.logger.warn(
        `Validation failed with ${reasons.length} error(s)`,
        JSON.stringify(reasons.map((r) => r.type)),
      );
      return {
        message: 'Validation failed',
        reasons,
      };
    }

    this.logger.log('Validation successful - all checks passed');
    return {
      message: 'Accepted',
    };
  }
}
