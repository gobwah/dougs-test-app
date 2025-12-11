import { MovementService } from '../../src/models/movements/movement.service';
import { BalanceService } from '../../src/models/balances/balance.service';
import { DuplicateService } from '../../src/models/duplicates/duplicate.service';
import {
  BalanceDto,
  MovementDto,
  ValidationRequestDto,
} from 'src/models/movements/dto/request.dto';

describe('Performance Tests', () => {
  let movementService: MovementService;
  let balanceService: BalanceService;
  let duplicateService: DuplicateService;

  beforeEach(() => {
    balanceService = new BalanceService();
    duplicateService = new DuplicateService();
    movementService = new MovementService(duplicateService, balanceService);
  });

  /**
   * Generate test data for performance testing
   */
  function generateMovements(count: number): MovementDto[] {
    const movements: MovementDto[] = [];
    const labels = [
      'SALARY PAYMENT',
      'RENT PAYMENT',
      'UTILITIES',
      'GROCERIES',
      'RESTAURANT',
      'TRANSPORT',
      'ENTERTAINMENT',
    ];

    for (let i = 1; i <= count; i++) {
      const date = new Date(2024, 0, 1 + (i % 365));
      movements.push({
        id: i,
        date: date.toISOString().split('T')[0],
        label: labels[i % labels.length],
        amount: Math.round((Math.random() * 2000 - 1000) * 100) / 100,
      });
    }

    return movements;
  }

  function generateBalances(
    movementCount: number,
    balanceCount: number,
  ): BalanceDto[] {
    const balances: BalanceDto[] = [];
    const daysBetween = Math.floor(365 / balanceCount);

    for (let i = 0; i < balanceCount; i++) {
      const date = new Date(2024, 0, 1 + i * daysBetween);
      balances.push({
        date: date.toISOString().split('T')[0],
        balance: Math.round(Math.random() * 10000 * 100) / 100,
      });
    }

    return balances;
  }

  describe('Small dataset (100 movements, 4 balances)', () => {
    it('should validate in less than 100ms', () => {
      const movements = generateMovements(100);
      const balances = generateBalances(100, 4);
      const request: ValidationRequestDto = { movements, balances };

      const start = process.hrtime.bigint();
      movementService.validateMovements(request);
      const end = process.hrtime.bigint();

      const durationMs = Number(end - start) / 1_000_000;
      expect(durationMs).toBeLessThan(100);
      console.log(`Small dataset: ${durationMs.toFixed(2)}ms`);
    });
  });

  describe('Medium dataset (1,000 movements, 12 balances)', () => {
    it('should validate in less than 500ms', () => {
      const movements = generateMovements(1000);
      const balances = generateBalances(1000, 12);
      const request: ValidationRequestDto = { movements, balances };

      const start = process.hrtime.bigint();
      movementService.validateMovements(request);
      const end = process.hrtime.bigint();

      const durationMs = Number(end - start) / 1_000_000;
      expect(durationMs).toBeLessThan(500);
      console.log(`Medium dataset: ${durationMs.toFixed(2)}ms`);
    });
  });

  describe('Large dataset (10,000 movements, 24 balances)', () => {
    it('should validate in less than 5 seconds', () => {
      const movements = generateMovements(10000);
      const balances = generateBalances(10000, 24);
      const request: ValidationRequestDto = { movements, balances };

      const start = process.hrtime.bigint();
      movementService.validateMovements(request);
      const end = process.hrtime.bigint();

      const durationMs = Number(end - start) / 1_000_000;
      expect(durationMs).toBeLessThan(5000);
      console.log(`Large dataset: ${durationMs.toFixed(2)}ms`);
    });
  });

  describe('Performance with duplicates detection', () => {
    it('should handle duplicates efficiently in medium dataset', () => {
      const movements = generateMovements(1000);
      // Add some duplicates
      for (let i = 0; i < 50; i++) {
        movements.push({
          ...movements[i],
          id: movements.length + i + 1,
        });
      }
      const balances = generateBalances(1000, 12);
      const request: ValidationRequestDto = { movements, balances };

      const start = process.hrtime.bigint();
      movementService.validateMovements(request);
      const end = process.hrtime.bigint();

      const durationMs = Number(end - start) / 1_000_000;
      expect(durationMs).toBeLessThan(1000);
      console.log(`Medium dataset with duplicates: ${durationMs.toFixed(2)}ms`);
    });
  });

  describe('Memory usage', () => {
    it('should not exceed reasonable memory for large dataset', () => {
      const movements = generateMovements(10000);
      const balances = generateBalances(10000, 24);
      const request: ValidationRequestDto = { movements, balances };

      const memBefore = process.memoryUsage().heapUsed;
      movementService.validateMovements(request);
      const memAfter = process.memoryUsage().heapUsed;

      const memUsedMB = (memAfter - memBefore) / 1024 / 1024;
      expect(memUsedMB).toBeLessThan(100); // Should use less than 100MB
      console.log(`Memory used: ${memUsedMB.toFixed(2)}MB`);
    });
  });
});
