import { Module } from '@nestjs/common';
import { BalanceService } from './models/balances/balance.service';
import { DuplicateService } from './models/duplicates/duplicate.service';
import { HealthController } from './health/health.controller';
import { MovementController } from './models/movements/movement.controller';
import { MovementService } from './models/movements/movement.service';

@Module({
  imports: [],
  controllers: [MovementController, HealthController],
  providers: [MovementService, DuplicateService, BalanceService],
})
export class AppModule {}
