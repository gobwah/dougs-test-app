import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const ttl = configService.get<number>('throttleTtl', 60);
        const limit = configService.get<number>('throttleLimit', 100);
        return [
          {
            ttl: ttl * 1000, // Convert seconds to milliseconds
            limit,
          },
        ];
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [MovementController, HealthController],
  providers: [
    MovementService,
    DuplicateService,
    BalanceService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
