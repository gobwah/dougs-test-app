import { Injectable, Logger } from '@nestjs/common';
import { ValidationRequestDto } from './dto/request.dto';
import {
  ValidationFailureResponse,
  ValidationReason,
  ValidationReasonDto,
  ValidationReasonType,
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

    // Validate date order BEFORE sorting to preserve original indices
    this.logger.debug('Validating date order of balance points');
    this.balanceService.validateDateOrder(
      request.balances.map((b) => ({
        date: new Date(b.date),
        balance: b.balance,
      })),
      reasons,
    );

    const movements = parseAndSortMovements(request.movements);
    const balances = parseAndSortBalances(request.balances);

    this.logger.debug('Detecting duplicate transactions');
    this.duplicateService.detectAndReportDuplicates(movements, reasons);

    this.logger.debug('Validating balances against movements');
    this.balanceService.validateBalances(balances, movements, reasons);

    if (reasons.length > 0) {
      this.logger.warn(
        `Validation failed with ${reasons.length} error(s)`,
        JSON.stringify(reasons.map((r) => r.type)),
      );
      // Group errors by type
      const groupedReasons = this.groupReasonsByType(reasons);
      return {
        message: 'Validation failed',
        reasons: groupedReasons,
      };
    }

    this.logger.log('Validation successful - all checks passed');
    return {
      message: 'Accepted',
    };
  }

  /**
   * Group validation reasons by type
   * Time complexity: O(n) where n is the number of reasons
   * Space complexity: O(n) for the grouped map and result array
   */
  private groupReasonsByType(
    reasons: ValidationReason[],
  ): ValidationReasonDto[] {
    const grouped = new Map<
      ValidationReasonType,
      Array<{ message: string; details: ValidationReason['details'] }>
    >();

    for (const reason of reasons) {
      const existing = grouped.get(reason.type) || [];
      existing.push({
        message: reason.message,
        details: reason.details,
      });
      grouped.set(reason.type, existing);
    }

    // Return grouped reasons, maintaining order of first occurrence of each type
    const result: ValidationReasonDto[] = [];
    const seenTypes = new Set<ValidationReasonType>();

    for (const reason of reasons) {
      if (!seenTypes.has(reason.type)) {
        seenTypes.add(reason.type);
        const errors = grouped.get(reason.type) || [];
        result.push({
          type: reason.type,
          errors,
        });
      }
    }

    return result;
  }
}
