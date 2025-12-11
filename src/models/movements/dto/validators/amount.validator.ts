import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidAmount', async: false })
export class IsValidAmountConstraint implements ValidatorConstraintInterface {
  validate(amount: number): boolean {
    // Check if it's a number
    if (typeof amount !== 'number') {
      return false;
    }

    // Reject NaN
    if (Number.isNaN(amount)) {
      return false;
    }

    // Reject Infinity
    if (!Number.isFinite(amount)) {
      return false;
    }

    return true;
  }

  defaultMessage(): string {
    return 'Amount must be a valid finite number (not NaN or Infinity)';
  }
}

export function IsValidAmount(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidAmountConstraint,
    });
  };
}
