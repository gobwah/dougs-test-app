import { Module } from '@nestjs/common';
import { MovementsController } from './movements/movements.controller';
import { MovementsService } from './movements/movements.service';

@Module({
  imports: [],
  controllers: [MovementsController],
  providers: [MovementsService],
})
export class AppModule {}
