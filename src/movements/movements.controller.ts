import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { MovementsService } from './movements.service';
import { ValidationRequestDto } from './dto/validation-request.dto';
import {
  ValidationFailureResponse,
  ValidationSuccessResponse,
} from './dto/validation-response.dto';

@Controller('movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Post('validation')
  @HttpCode(HttpStatus.OK)
  validateMovements(
    @Body() request: ValidationRequestDto,
  ): ValidationSuccessResponse | ValidationFailureResponse {
    const result = this.movementsService.validateMovements(request);

    if ('reasons' in result && result.reasons.length > 0) {
      // Return 400 Bad Request if validation failed
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
