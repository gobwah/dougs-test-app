import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'hasMovementsIfBalances', async: false })
export class HasMovementsIfBalancesConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const object = args.object as {
      movements?: unknown[];
      balances?: unknown[];
    };
    const movements = object.movements;
    const balances = object.balances;

    // If balances are provided, movements should also be provided
    if (balances && balances.length > 0) {
      return movements !== undefined && movements !== null;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Movements must be provided when balances are present';
  }
}

export function HasMovementsIfBalances(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: HasMovementsIfBalancesConstraint,
    });
  };
}
