import { Injectable, Logger } from '@nestjs/common';
import {
  ValidationReason,
  ValidationReasonType,
} from '../movements/dto/response.dto';
import { Movement } from '../movements/entities/movement.entity';
import { DuplicateMovement } from './entities/duplicate.entity';
import { findDuplicatesInGroups } from './utils/duplicate-detection.util';
import { groupMovementsByDateAndAmount } from './utils/duplicate-grouping.util';

@Injectable()
export class DuplicateService {
  private readonly logger = new Logger(DuplicateService.name);

  /**
   * Detect duplicate movements
   * Time complexity: O(n * m + Σ(k + k'² * m)) where:
   *   - n = number of movements, m = average label length
   *   - O(n * m) for grouping by date+amount and normalizing labels
   *   - O(k) for grouping by exact label in each group of size k
   *   - O(k'² * m) for comparing unique labels (k' << k typically)
   *   - In worst case (all different labels): O(n² * m)
   *   - In best case (many identical labels): O(n * m)
   * Space complexity: O(n) for the maps and duplicate arrays
   */
  detectDuplicates(movements: Movement[]): DuplicateMovement[] {
    const potentialDuplicates = groupMovementsByDateAndAmount(movements);
    const duplicatesMap = findDuplicatesInGroups(potentialDuplicates);
    return Array.from(duplicatesMap.values());
  }

  /**
   * Detect duplicates and add reasons to the array if found
   * Time complexity: O(n² * m) where n is the number of movements and m is the average label length
   * Space complexity: O(n) for the map and duplicate arrays
   */
  detectAndReportDuplicates(
    movements: Movement[],
    reasons: ValidationReason[],
  ): void {
    this.logger.debug(`Detecting duplicates in ${movements.length} movements`);
    const duplicates = this.detectDuplicates(movements);
    if (duplicates.length > 0) {
      this.logger.warn(`Found ${duplicates.length} duplicate transaction(s)`);
      reasons.push({
        type: ValidationReasonType.DUPLICATE_TRANSACTION,
        message: `Found ${duplicates.length} duplicate transaction(s)`,
        details: {
          duplicateMovements: duplicates,
        },
      });
    } else {
      this.logger.debug('No duplicates detected');
    }
  }
}
