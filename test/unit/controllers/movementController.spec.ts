import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BalanceService } from '../../../src/models/balances/balance.service';
import { DuplicateService } from '../../../src/models/duplicates/duplicate.service';
import { ValidationRequestDto } from '../../../src/models/movements/dto/request.dto';
import { MovementController } from '../../../src/models/movements/movement.controller';
import { MovementService } from '../../../src/models/movements/movement.service';

describe('MovementController', () => {
  let controller: MovementController;
  let service: MovementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovementController],
      providers: [MovementService, DuplicateService, BalanceService],
    }).compile();

    controller = module.get<MovementController>(MovementController);
    service = module.get<MovementService>(MovementService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('validateMovements', () => {
    it('should return Accepted for valid movements', () => {
      const request: ValidationRequestDto = {
        movements: [
          {
            id: 1,
            date: '2024-01-01',
            label: 'Transaction 1',
            amount: 100,
          },
        ],
        balances: [
          {
            date: '2024-01-31',
            balance: 100,
          },
        ],
      };

      const result = controller.validateMovements(request);
      expect(result.message).toBe('Accepted');
    });

    it('should throw HttpException with 400 status for validation failures', () => {
      const request: ValidationRequestDto = {
        movements: [
          {
            id: 1,
            date: '2024-01-01',
            label: 'Transaction 1',
            amount: 100,
          },
        ],
        balances: [
          {
            date: '2024-01-31',
            balance: 50, // Wrong balance
          },
        ],
      };

      expect(() => controller.validateMovements(request)).toThrow(
        HttpException,
      );
      expect(() => controller.validateMovements(request)).toThrow(
        expect.objectContaining({
          status: HttpStatus.BAD_REQUEST,
        }),
      );
    });
  });
});
