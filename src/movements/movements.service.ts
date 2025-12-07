import { Injectable } from '@nestjs/common';
import { ValidationRequestDto } from './dto/validation-request.dto';
import {
  ValidationFailureResponse,
  ValidationReason,
  ValidationReasonType,
  ValidationSuccessResponse,
} from './dto/validation-response.dto';

interface Movement {
  id: number;
  date: Date;
  label: string;
  amount: number;
}

interface Balance {
  date: Date;
  balance: number;
}

@Injectable()
export class MovementsService {
  validateMovements(
    request: ValidationRequestDto,
  ): ValidationSuccessResponse | ValidationFailureResponse {
    const reasons: ValidationReason[] = [];

    // Parse and sort movements by date
    const movements: Movement[] = request.movements
      .map((m) => ({
        id: m.id,
        date: new Date(m.date),
        label: m.label,
        amount: m.amount,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Parse and sort balances by date
    const balances: Balance[] = request.balances
      .map((b) => ({
        date: new Date(b.date),
        balance: b.balance,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Validate date order
    if (balances.length > 0) {
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
    const duplicates = this.detectDuplicates(movements);
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
      const tolerance = 0.01; // Allow small floating point differences

      // Validate first balance point
      // We can validate it if we have movements up to the first point by assuming initial balance = 0
      // This is a reasonable assumption: if the first balance point is correct, it should equal
      // the sum of all movements up to that point (assuming starting balance was 0)
      const firstBalance = balances[0];
      const movementsUpToFirst = movements.filter(
        (m) => m.date <= firstBalance.date,
      );

      if (movementsUpToFirst.length > 0) {
        const sumMovementsUpToFirst = movementsUpToFirst.reduce(
          (sum, m) => sum + m.amount,
          0,
        );

        // Assume initial balance = 0 and validate first point
        // Expected balance = 0 + sum of movements up to first point
        const expectedFirstBalance = sumMovementsUpToFirst;
        const difference = Math.abs(
          expectedFirstBalance - firstBalance.balance,
        );

        if (difference > tolerance) {
          reasons.push({
            type: ValidationReasonType.BALANCE_MISMATCH,
            message: `Balance mismatch at first control point ${firstBalance.date.toISOString()}`,
            details: {
              balanceDate: firstBalance.date.toISOString(),
              expectedBalance: expectedFirstBalance,
              actualBalance: firstBalance.balance,
              difference: expectedFirstBalance - firstBalance.balance,
            },
          });
        }
      }
      // If no movements up to first point, we trust it as per problem statement
      // ("Le solde indiqué sur un relevé bancaire est juste")

      // Validate subsequent balance points
      for (let i = 1; i < balances.length; i++) {
        const previousBalance = balances[i - 1];
        const currentBalance = balances[i];

        // Get movements between the two balance points
        const movementsInPeriod = movements.filter(
          (m) => m.date > previousBalance.date && m.date <= currentBalance.date,
        );
        const sumMovementsInPeriod = movementsInPeriod.reduce(
          (sum, m) => sum + m.amount,
          0,
        );

        // The difference between balances should equal the sum of movements in that period
        const expectedBalance = previousBalance.balance + sumMovementsInPeriod;
        const difference = Math.abs(expectedBalance - currentBalance.balance);

        if (difference > tolerance) {
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

      // Check if there are movements after the last balance point
      // This could indicate missing balance control points or missing transactions
      const lastBalanceDate = balances.at(-1).date;
      const movementsAfterLastBalance = movements.filter(
        (m) => m.date > lastBalanceDate,
      );

      if (movementsAfterLastBalance.length > 0) {
        const totalAfterLastBalance = movementsAfterLastBalance.reduce(
          (sum, m) => sum + m.amount,
          0,
        );
        reasons.push({
          type: ValidationReasonType.MISSING_TRANSACTION,
          message: `There are ${movementsAfterLastBalance.length} movement(s) after the last balance control point. This may indicate missing balance control points or missing transactions.`,
          details: {
            periodStart: lastBalanceDate.toISOString(),
            periodEnd: movements.at(-1).date.toISOString(),
            missingAmount: totalAfterLastBalance,
          },
        });
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

  private detectDuplicates(movements: Movement[]): Array<{
    id: number;
    date: string;
    amount: number;
    label: string;
  }> {
    const duplicates: Array<{
      id: number;
      date: string;
      amount: number;
      label: string;
    }> = [];

    // Group movements by date and amount (same day, same amount could be duplicates)
    const potentialDuplicates = new Map<string, Movement[]>();

    for (const movement of movements) {
      const dateKey = movement.date.toISOString().split('T')[0]; // YYYY-MM-DD
      const key = `${dateKey}_${movement.amount}`;

      if (!potentialDuplicates.has(key)) {
        potentialDuplicates.set(key, []);
      }
      potentialDuplicates.get(key).push(movement);
    }

    // Check for duplicates: same date, same amount, and similar labels
    for (const group of potentialDuplicates.values()) {
      if (group.length > 1) {
        // Check if labels are similar (normalized comparison)
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const label1 = this.normalizeLabel(group[i].label);
            const label2 = this.normalizeLabel(group[j].label);

            // If labels are similar (same or very close), consider them duplicates
            if (this.areLabelsSimilar(label1, label2)) {
              duplicates.push(
                {
                  id: group[i].id,
                  date: group[i].date.toISOString(),
                  amount: group[i].amount,
                  label: group[i].label,
                },
                {
                  id: group[j].id,
                  date: group[j].date.toISOString(),
                  amount: group[j].amount,
                  label: group[j].label,
                },
              );
            }
          }
        }
      }
    }

    // Remove duplicates from the duplicates array (if same transaction appears multiple times)
    const uniqueDuplicates = Array.from(
      new Map(duplicates.map((d) => [d.id, d])).values(),
    );

    return uniqueDuplicates;
  }

  private normalizeLabel(label: string): string {
    return label
      .toLowerCase()
      .trim()
      .replaceAll(/\s+/g, ' ')
      .replaceAll(/[^\w\s]/g, '');
  }

  private areLabelsSimilar(label1: string, label2: string): boolean {
    // Exact match
    if (label1 === label2) {
      return true;
    }

    // Check if one contains the other (for cases like "PAYMENT" vs "PAYMENT REF 123")
    if (label1.includes(label2) || label2.includes(label1)) {
      return true;
    }

    // Calculate similarity using Levenshtein distance (simplified)
    const similarity = this.calculateSimilarity(label1, label2);
    return similarity > 0.8; // 80% similarity threshold
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
      return 1;
    }

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}
