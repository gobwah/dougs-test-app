import request from 'supertest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ValidationReasonType } from '../../src/movements/dto/validation-response.dto';

// Get the server URL from the global setup
const SERVER_URL =
  (global as any).__E2E_SERVER_URL__ || 'http://localhost:3001';

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
      expect(balanceMismatchReason.details.expectedBalance).toBe(1929.5);
      expect(balanceMismatchReason.details.actualBalance).toBe(2000.0);
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
      expect(duplicateReason.details.duplicateMovements).toBeDefined();
      expect(duplicateReason.details.duplicateMovements.length).toBeGreaterThan(
        0,
      );

      // Verify that the duplicate movements are correctly identified
      const duplicateIds = duplicateReason.details.duplicateMovements.map(
        (m: any) => m.id,
      );
      expect(duplicateIds).toContain(2);
      expect(duplicateIds).toContain(3);
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
