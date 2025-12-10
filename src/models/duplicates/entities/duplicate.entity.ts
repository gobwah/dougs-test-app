export interface DuplicateMovement {
  id: number;
  date: string;
  amount: number;
  label: string;
  duplicateType: 'exact' | 'similar';
}
