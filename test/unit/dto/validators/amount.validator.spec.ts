import { IsValidAmount } from '../../../../src/models/movements/dto/validators/amount.validator';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

class TestDto {
  @IsValidAmount()
  amount: number;
}

describe('Amount Validator', () => {
  it('should accept valid number', async () => {
    const dto = plainToInstance(TestDto, {
      amount: 1000,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept negative number', async () => {
    const dto = plainToInstance(TestDto, {
      amount: -500,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept zero', async () => {
    const dto = plainToInstance(TestDto, {
      amount: 0,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept decimal number', async () => {
    const dto = plainToInstance(TestDto, {
      amount: 123.45,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject NaN', async () => {
    const dto = plainToInstance(TestDto, {
      amount: NaN,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isValidAmount');
  });

  it('should reject Infinity', async () => {
    const dto = plainToInstance(TestDto, {
      amount: Infinity,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isValidAmount');
  });

  it('should reject -Infinity', async () => {
    const dto = plainToInstance(TestDto, {
      amount: -Infinity,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isValidAmount');
  });

  it('should reject non-number types', async () => {
    const dto = plainToInstance(TestDto, {
      amount: 'not a number' as unknown as number,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
