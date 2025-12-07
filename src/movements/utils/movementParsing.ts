import { MovementDto, BalanceDto } from '../dto/validation-request.dto';

export interface Movement {
  id: number;
  date: Date;
  label: string;
  amount: number;
}

export interface Balance {
  date: Date;
  balance: number;
}

/**
 * Parse and sort movements by date
 * Time complexity: O(n log n) where n is the number of movements
 * Space complexity: O(n) for the new array
 */
export function parseAndSortMovements(movements: MovementDto[]): Movement[] {
  return movements
    .map((m) => ({
      id: m.id,
      date: new Date(m.date),
      label: m.label,
      amount: m.amount,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Parse and sort balances by date
 * Time complexity: O(n log n) where n is the number of balances
 * Space complexity: O(n) for the new array
 */
export function parseAndSortBalances(balances: BalanceDto[]): Balance[] {
  return balances
    .map((b) => ({
      date: new Date(b.date),
      balance: b.balance,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Validate that balances are in chronological order
 * Time complexity: O(n) where n is the number of balances
 * Space complexity: O(1)
 */
export function validateBalanceDateOrder(balances: Balance[]): boolean {
  for (let i = 1; i < balances.length; i++) {
    if (balances[i].date <= balances[i - 1].date) {
      return false;
    }
  }
  return true;
}
