import { Module } from '@nestjs/common';
import { MovementsController } from './movements/movementsController';
import { MovementsService } from './movements/movementsService';
import { HealthController } from './health/healthController';

@Module({
  imports: [],
  controllers: [MovementsController, HealthController],
  providers: [MovementsService],
})
export class AppModule {}
