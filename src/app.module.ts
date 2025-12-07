import { Module } from '@nestjs/common';
import { MovementsController } from './movements/movements.controller';
import { MovementsService } from './movements/movements.service';
import { HealthController } from './health/health.controller';

@Module({
  imports: [],
  controllers: [MovementsController, HealthController],
  providers: [MovementsService],
})
export class AppModule {}
