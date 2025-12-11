import { Module } from '@nestjs/common';
import { BalanceService } from './models/balances/balance.service';
import { DuplicateService } from './models/duplicates/duplicate.service';
import { MovementController } from './models/movements/movement.controller';
import { MovementService } from './models/movements/movement.service';

@Module({
  controllers: [MovementController],
  providers: [MovementService, DuplicateService, BalanceService],
})
export class AppModule {}
