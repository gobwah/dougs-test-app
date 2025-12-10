import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidDate', async: false })
export class IsValidDateConstraint implements ValidatorConstraintInterface {
  validate(dateString: string, args: ValidationArguments): boolean {
    if (!dateString || typeof dateString !== 'string') {
      return false;
    }

    // Check format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return false;
    }

    const date = new Date(dateString);
    // Check if date is valid
    if (Number.isNaN(date.getTime())) {
      return false;
    }

    // Check if the parsed date matches the input (to catch invalid dates like 2024-13-45)
    const [year, month, day] = dateString.split('-').map(Number);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid date in YYYY-MM-DD format`;
  }
}

@ValidatorConstraint({ name: 'isNotFutureDate', async: false })
export class IsNotFutureDateConstraint implements ValidatorConstraintInterface {
  validate(dateString: string): boolean {
    if (!dateString) {
      return true; // Let other validators handle empty values
    }

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return true; // Let other validators handle invalid dates
    }

    // Allow dates up to 1 day in the future (for timezone differences)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    return date <= tomorrow;
  }

  defaultMessage(): string {
    return 'Date cannot be in the future';
  }
}

@ValidatorConstraint({ name: 'isNotTooOld', async: false })
export class IsNotTooOldConstraint implements ValidatorConstraintInterface {
  validate(dateString: string): boolean {
    if (!dateString) {
      return true; // Let other validators handle empty values
    }

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return true; // Let other validators handle invalid dates
    }

    // Reject dates older than 100 years
    const hundredYearsAgo = new Date();
    hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);

    return date >= hundredYearsAgo;
  }

  defaultMessage(): string {
    return 'Date cannot be older than 100 years';
  }
}

export function IsValidDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidDateConstraint,
    });
  };
}

export function IsNotFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotFutureDateConstraint,
    });
  };
}

export function IsNotTooOld(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotTooOldConstraint,
    });
  };
}
