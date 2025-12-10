import { Test, TestingModule } from '@nestjs/testing';
import { DuplicateService } from '../../../src/models/duplicates/duplicate.service';
import { ValidationReason } from '../../../src/models/movements/dto/response.dto';
import { Movement } from '../../../src/models/movements/entities/movement.entity';

describe('DuplicateService', () => {
  let service: DuplicateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DuplicateService],
    }).compile();

    service = module.get<DuplicateService>(DuplicateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('detectDuplicates', () => {
    it('should return empty array when no duplicates', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-01'),
          label: 'Transaction 1',
          amount: 100,
        },
        {
          id: 2,
          date: new Date('2024-01-02'),
          label: 'Transaction 2',
          amount: 200,
        },
      ];

      const duplicates = service.detectDuplicates(movements);
      expect(duplicates).toEqual([]);
    });

    it('should detect exact duplicates', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-01'),
          label: 'Payment ABC',
          amount: 100,
        },
        {
          id: 2,
          date: new Date('2024-01-01'),
          label: 'Payment ABC',
          amount: 100,
        },
      ];

      const duplicates = service.detectDuplicates(movements);
      expect(duplicates.length).toBe(2);
      expect(duplicates[0].duplicateType).toBe('exact');
      expect(duplicates[1].duplicateType).toBe('exact');
    });

    it('should detect similar duplicates', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-01'),
          label: 'Payment ABC',
          amount: 100,
        },
        {
          id: 2,
          date: new Date('2024-01-01'),
          label: 'Payment Abc',
          amount: 100,
        },
      ];

      const duplicates = service.detectDuplicates(movements);
      expect(duplicates.length).toBe(2);
      expect(duplicates[0].duplicateType).toBe('exact');
      expect(duplicates[1].duplicateType).toBe('exact');
    });
  });

  describe('detectAndReportDuplicates', () => {
    it('should not add reason when no duplicates', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-01'),
          label: 'Transaction 1',
          amount: 100,
        },
      ];
      const reasons: ValidationReason[] = [];

      service.detectAndReportDuplicates(movements, reasons);
      expect(reasons.length).toBe(0);
    });

    it('should add reason when duplicates found', () => {
      const movements: Movement[] = [
        {
          id: 1,
          date: new Date('2024-01-01'),
          label: 'Payment ABC',
          amount: 100,
        },
        {
          id: 2,
          date: new Date('2024-01-01'),
          label: 'Payment ABC',
          amount: 100,
        },
      ];
      const reasons: ValidationReason[] = [];

      service.detectAndReportDuplicates(movements, reasons);
      expect(reasons.length).toBe(1);
      expect(reasons[0].type).toBe('DUPLICATE_TRANSACTION');
      expect(reasons[0].message).toContain('duplicate transaction');
      expect(reasons[0].details?.duplicateMovements).toBeDefined();
      expect(reasons[0].details?.duplicateMovements?.length).toBe(2);
    });
  });
});
