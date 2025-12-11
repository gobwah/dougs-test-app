export class MovementDto {
  id: number;
  date: string;
  label: string;
  amount: number;
}

export class BalanceDto {
  date: string;
  balance: number;
}

export class ValidationRequestDto {
  movements: MovementDto[];
  balances: BalanceDto[];
}
