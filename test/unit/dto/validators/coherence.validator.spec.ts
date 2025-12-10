import { HasMovementsIfBalances } from '../../../../src/models/movements/dto/validators/coherence.validator';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

class TestDto {
  movements?: unknown[];
  @HasMovementsIfBalances()
  balances?: unknown[];
}

describe('Coherence Validator', () => {
  it('should accept when both movements and balances are provided', async () => {
    const dto = plainToInstance(TestDto, {
      movements: [{ id: 1 }],
      balances: [{ date: '2024-01-31' }],
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept when balances is empty', async () => {
    const dto = plainToInstance(TestDto, {
      movements: [{ id: 1 }],
      balances: [],
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept when balances is undefined', async () => {
    const dto = plainToInstance(TestDto, {
      movements: [{ id: 1 }],
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject when balances are provided but movements are not', async () => {
    const dto = plainToInstance(TestDto, {
      balances: [{ date: '2024-01-31' }],
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('hasMovementsIfBalances');
  });

  it('should reject when balances are provided but movements is null', async () => {
    const dto = plainToInstance(TestDto, {
      movements: null,
      balances: [{ date: '2024-01-31' }],
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('hasMovementsIfBalances');
  });

  it('should accept when balances is empty array but movements exist', async () => {
    const dto = plainToInstance(TestDto, {
      movements: [{ id: 1 }],
      balances: [],
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
