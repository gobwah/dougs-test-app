import { Module } from '@nestjs/common';
import { MovementController } from './movements/movementController';
import { MovementService } from './movements/movementService';
import { HealthController } from './health/healthController';

@Module({
  imports: [],
  controllers: [MovementController, HealthController],
  providers: [MovementService],
})
export class AppModule {}
