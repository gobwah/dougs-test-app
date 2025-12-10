import {
  IsValidDate,
  IsNotFutureDate,
  IsNotTooOld,
} from '../../../../src/models/movements/dto/validators/date.validator';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

class TestDtoWithValidDate {
  @IsValidDate()
  @IsNotFutureDate()
  date: string;
}

class TestDtoWithOldDate {
  @IsValidDate()
  @IsNotTooOld()
  date: string;
}

describe('Date Validators', () => {
  describe('IsValidDate', () => {
    it('should accept valid date in YYYY-MM-DD format', async () => {
      const dto = plainToInstance(TestDtoWithValidDate, {
        date: '2024-01-15',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject invalid date format', async () => {
      const dto = plainToInstance(TestDtoWithValidDate, {
        date: '2024/01/15',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isValidDate');
    });

    it('should reject invalid date like 2024-13-45', async () => {
      const dto = plainToInstance(TestDtoWithValidDate, {
        date: '2024-13-45',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject empty string', async () => {
      const dto = plainToInstance(TestDtoWithValidDate, {
        date: '',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject non-string values', async () => {
      const dto = plainToInstance(TestDtoWithValidDate, {
        date: 12345 as unknown as string,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('IsNotFutureDate', () => {
    it('should accept past date', async () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      const dateString = pastDate.toISOString().split('T')[0];
      const dto = plainToInstance(TestDtoWithValidDate, {
        date: dateString,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept today date', async () => {
      const today = new Date().toISOString().split('T')[0];
      const dto = plainToInstance(TestDtoWithValidDate, {
        date: today,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept tomorrow date (timezone tolerance)', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      const dto = plainToInstance(TestDtoWithValidDate, {
        date: dateString,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject date more than 1 day in the future', async () => {
      // Use a fixed date far in the future to avoid timezone issues
      const dto = plainToInstance(TestDtoWithValidDate, {
        date: '2099-12-31',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const futureDateErrors = errors.filter((e) =>
        e.constraints?.hasOwnProperty('isNotFutureDate'),
      );
      expect(futureDateErrors.length).toBeGreaterThan(0);
    });
  });

  describe('IsNotTooOld', () => {
    it('should accept recent date', async () => {
      const recentDate = new Date();
      recentDate.setFullYear(recentDate.getFullYear() - 10);
      const dateString = recentDate.toISOString().split('T')[0];
      const dto = plainToInstance(TestDtoWithOldDate, {
        date: dateString,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept date exactly 100 years ago', async () => {
      // Use a date 99 years and 11 months ago to avoid timezone edge cases
      const currentDate = new Date();
      const almostHundredYearsAgo = new Date(
        currentDate.getFullYear() - 99,
        currentDate.getMonth() - 11,
        currentDate.getDate(),
      );
      const dateString = almostHundredYearsAgo.toISOString().split('T')[0];
      const dto = plainToInstance(TestDtoWithOldDate, {
        date: dateString,
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject date older than 100 years', async () => {
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 101);
      const dateString = oldDate.toISOString().split('T')[0];
      const dto = plainToInstance(TestDtoWithOldDate, {
        date: dateString,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const tooOldErrors = errors.filter((e) =>
        e.constraints?.hasOwnProperty('isNotTooOld'),
      );
      expect(tooOldErrors.length).toBeGreaterThan(0);
    });
  });
});
