import request from 'supertest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ValidationReasonType } from '../../src/models/movements/dto/response.dto';

// Get the server URL from the global setup
const SERVER_URL =
  (globalThis as any).__E2E_SERVER_URL__ || 'http://localhost:3001';

describe('Movements E2E Tests (Examples)', () => {
  const loadExampleFile = (filename: string): any => {
    const filePath = path.join(__dirname, '../../examples', filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
  };

  describe('example-valid.json', () => {
    it('should accept valid movements and balances', async () => {
      const testData = loadExampleFile('example-valid.json');

      const response = await request(SERVER_URL)
        .post('/movements/validation')
        .send(testData)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Accepted',
      });
    });
  });

  describe('example-balance-mismatch.json', () => {
    it('should reject movements with balance mismatch', async () => {
      const testData = loadExampleFile('example-balance-mismatch.json');

      const response = await request(SERVER_URL)
        .post('/movements/validation')
        .send(testData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.reasons).toBeDefined();
      expect(response.body.reasons.length).toBeGreaterThan(0);

      const balanceMismatchReason = response.body.reasons.find(
        (reason: any) => reason.type === ValidationReasonType.BALANCE_MISMATCH,
      );
      expect(balanceMismatchReason).toBeDefined();
      expect(balanceMismatchReason.errors.length).toBeGreaterThan(0);
      const firstError = balanceMismatchReason.errors[0];
      expect(firstError.details.expectedBalance).toBe(1929.5);
      expect(firstError.details.actualBalance).toBe(2000);
    });
  });

  describe('example-multiple-balances.json', () => {
    it('should accept movements with multiple balance control points', async () => {
      const testData = loadExampleFile('example-multiple-balances.json');

      const response = await request(SERVER_URL)
        .post('/movements/validation')
        .send(testData)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Accepted',
      });
    });
  });

  describe('example-with-duplicates.json', () => {
    it('should reject movements with duplicate transactions', async () => {
      const testData = loadExampleFile('example-with-duplicates.json');

      const response = await request(SERVER_URL)
        .post('/movements/validation')
        .send(testData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.reasons).toBeDefined();
      expect(response.body.reasons.length).toBeGreaterThan(0);

      const duplicateReason = response.body.reasons.find(
        (reason: any) =>
          reason.type === ValidationReasonType.DUPLICATE_TRANSACTION,
      );
      expect(duplicateReason).toBeDefined();
      expect(duplicateReason.errors.length).toBeGreaterThan(0);
      const firstError = duplicateReason.errors[0];
      expect(firstError.details.duplicateMovements).toBeDefined();
      expect(firstError.details.duplicateMovements.length).toBeGreaterThan(0);

      // Verify that the duplicate movements are correctly identified
      const duplicateIds = firstError.details.duplicateMovements.map(
        (m: any) => m.id,
      );
      expect(duplicateIds).toContain(2);
      expect(duplicateIds).toContain(3);

      // Verify that duplicateType is present and valid for all duplicate movements
      expect(firstError.details.duplicateMovements.length).toBeGreaterThan(0);
      firstError.details.duplicateMovements.forEach((m: any) => {
        expect(m).toHaveProperty('duplicateType');
        expect(m.duplicateType).toBeDefined();
        expect(['exact', 'similar']).toContain(m.duplicateType);
      });

      // In this example, movements 2 and 3 have identical labels, so they should be 'exact'
      const movement2 = firstError.details.duplicateMovements.find(
        (m: any) => m.id === 2,
      );
      const movement3 = firstError.details.duplicateMovements.find(
        (m: any) => m.id === 3,
      );
      expect(movement2).toBeDefined();
      expect(movement3).toBeDefined();
      expect(movement2?.duplicateType).toBe('exact');
      expect(movement3?.duplicateType).toBe('exact');
    });
  });

  describe('example-large.json', () => {
    it('should handle large dataset and respond in less than 10 seconds', async () => {
      const testData = loadExampleFile('example-large.json');
      const startTime = Date.now();

      const response = await request(SERVER_URL)
        .post('/movements/validation')
        .send(testData)
        .expect((res) => {
          // Accept both 200 (valid) and 400 (validation errors) as valid responses
          // The important thing is that the server responds quickly
          if (res.status !== 200 && res.status !== 400) {
            throw new Error(`Expected 200 or 400, got ${res.status}`);
          }
        });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.body).toBeDefined();
      expect(duration).toBeLessThan(10000); // Less than 10 seconds

      console.log(
        `Large dataset processed in ${duration}ms (${(duration / 1000).toFixed(2)}s) - Status: ${response.status}`,
      );
    });
  });

  describe('Health check', () => {
    it('should return health status', async () => {
      const response = await request(SERVER_URL).get('/health').expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      });
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });
});
