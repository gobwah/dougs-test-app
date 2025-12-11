import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { MovementService } from './movement.service';
import { ValidationRequestDto } from './dto/request.dto';
import {
  ValidationFailureResponse,
  ValidationSuccessResponse,
} from './dto/response.dto';

@Controller('movements')
export class MovementController {
  constructor(private readonly movementsService: MovementService) {}

  @Post('validation')
  @HttpCode(HttpStatus.OK)
  validateMovements(
    @Body() request: ValidationRequestDto,
  ): ValidationSuccessResponse | ValidationFailureResponse {
    const result = this.movementsService.validateMovements(request);

    if ('reasons' in result && result.reasons && result.reasons.length > 0) {
      throw new HttpException(
        {
          message: result.message,
          reasons: result.reasons,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return result;
  }
}
