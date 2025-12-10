import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BalanceService } from './models/balances/balance.service';
import { DuplicateService } from './models/duplicates/duplicate.service';
import { HealthController } from './health/health.controller';
import { MovementController } from './models/movements/movement.controller';
import { MovementService } from './models/movements/movement.service';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),
  ],
  controllers: [MovementController, HealthController],
  providers: [MovementService, DuplicateService, BalanceService],
})
export class AppModule {}
