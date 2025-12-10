import { Module } from '@nestjs/common';
import { MovementController } from './movements/movement.controller';
import { MovementService } from './movements/movement.service';
import { DuplicateService } from './movements/duplicate.service';
import { HealthController } from './health/health.controller';

@Module({
  imports: [],
  controllers: [MovementController, HealthController],
  providers: [MovementService, DuplicateService],
})
export class AppModule {}
