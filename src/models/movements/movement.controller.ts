import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { MovementService } from './movement.service';
import { ValidationRequestDto } from './dto/request.dto';
import {
  ValidationFailureResponse,
  ValidationSuccessResponse,
} from './dto/response.dto';

@ApiTags('movements')
@Controller('movements')
export class MovementController {
  constructor(private readonly movementsService: MovementService) {}

  @Post('validation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate bank movements',
    description:
      'Validates a list of bank movements by comparing them with control points (balances). Detects inconsistencies, duplicates, and anomalies.',
  })
  @ApiBody({
    type: ValidationRequestDto,
    description: 'Validation data containing movements and balances',
    examples: {
      valid: {
        summary: 'Successful validation example',
        value: {
          movements: [
            {
              id: 1,
              date: '2024-01-05',
              label: 'SALARY PAYMENT',
              amount: 3000,
            },
            {
              id: 2,
              date: '2024-01-10',
              label: 'RENT PAYMENT',
              amount: -800,
            },
          ],
          balances: [
            {
              date: '2024-01-31',
              balance: 1929.5,
            },
          ],
        },
      },
      withError: {
        summary: 'Example with balance error',
        value: {
          movements: [
            {
              id: 1,
              date: '2024-01-05',
              label: 'SALARY PAYMENT',
              amount: 3000,
            },
          ],
          balances: [
            {
              date: '2024-01-31',
              balance: 2000,
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Validation successful - All movements are valid',
    type: ValidationSuccessResponse,
    examples: {
      success: {
        summary:
          'Validation successful - Example response when all movements are valid',
        value: {
          message: 'Accepted',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed - One or more errors have been detected',
    type: ValidationFailureResponse,
    examples: {
      balanceMismatch: {
        summary:
          'Balance mismatch error - The calculated balance does not match the control point balance',
        value: {
          message: 'Validation failed',
          reasons: [
            {
              type: 'BALANCE_MISMATCH',
              message:
                'Balance mismatch at control point 2024-01-31T00:00:00.000Z',
              details: {
                balanceDate: '2024-01-31T00:00:00.000Z',
                expectedBalance: 1929.5,
                actualBalance: 2000,
                difference: -70.5,
              },
            },
          ],
        },
      },
      duplicateTransaction: {
        summary:
          'Duplicate transactions detected - Transactions with the same date, same amount, and similar labels have been detected',
        value: {
          message: 'Validation failed',
          reasons: [
            {
              type: 'DUPLICATE_TRANSACTION',
              message: 'Found 2 duplicate transaction(s)',
              details: {
                duplicateMovements: [
                  {
                    id: 2,
                    date: '2024-01-10T00:00:00.000Z',
                    label: 'RENT PAYMENT',
                    amount: -800,
                    duplicateType: 'exact',
                  },
                  {
                    id: 3,
                    date: '2024-01-10T00:00:00.000Z',
                    label: 'RENT PAYMENT',
                    amount: -800,
                    duplicateType: 'exact',
                  },
                ],
              },
            },
          ],
        },
      },
      missingTransaction: {
        summary:
          'Transactions after the last control point - Movements exist after the last control point, possibly indicating missing transactions',
        value: {
          message: 'Validation failed',
          reasons: [
            {
              type: 'MISSING_TRANSACTION',
              message:
                'There are 1 movement(s) after the last balance control point. This may indicate missing balance control points or missing transactions.',
              details: {
                periodStart: '2024-01-31T00:00:00.000Z',
                periodEnd: '2024-02-01T00:00:00.000Z',
                missingAmount: -500,
              },
            },
          ],
        },
      },
      invalidDateOrder: {
        summary:
          'Invalid chronological order - Control points are not in chronological order',
        value: {
          message: 'Validation failed',
          reasons: [
            {
              type: 'INVALID_DATE_ORDER',
              message: 'Balance control points must be in chronological order',
              details: {
                balanceDate: '2024-01-15T00:00:00.000Z',
              },
            },
          ],
        },
      },
      multipleErrors: {
        summary:
          'Multiple errors detected - Example with multiple types of simultaneous errors',
        value: {
          message: 'Validation failed',
          reasons: [
            {
              type: 'BALANCE_MISMATCH',
              message:
                'Balance mismatch at control point 2024-01-31T00:00:00.000Z',
              details: {
                balanceDate: '2024-01-31T00:00:00.000Z',
                expectedBalance: 1929.5,
                actualBalance: 2000,
                difference: -70.5,
              },
            },
            {
              type: 'DUPLICATE_TRANSACTION',
              message: 'Found 1 duplicate transaction(s)',
              details: {
                duplicateMovements: [
                  {
                    id: 2,
                    date: '2024-01-10T00:00:00.000Z',
                    label: 'RENT PAYMENT',
                    amount: -800,
                    duplicateType: 'exact',
                  },
                ],
              },
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid request - Input data validation errors (date format, invalid amounts, etc.)',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 400,
        },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'date must be a valid date in YYYY-MM-DD format',
            'amount must be a valid finite number (not NaN or Infinity)',
          ],
        },
        error: {
          type: 'string',
          example: 'Bad Request',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
        },
        path: {
          type: 'string',
          example: '/movements/validation',
        },
        method: {
          type: 'string',
          example: 'POST',
        },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description:
      'Too many requests - Rate limiting limit reached. Please try again later.',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 429,
        },
        message: {
          type: 'string',
          example: 'ThrottlerException: Too Many Requests',
        },
        error: {
          type: 'string',
          example: 'Too Many Requests',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - An unexpected error occurred',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 500,
        },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['Internal Server Error'],
        },
        error: {
          type: 'string',
          example: 'Internal Server Error',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
        },
        path: {
          type: 'string',
          example: '/movements/validation',
        },
        method: {
          type: 'string',
          example: 'POST',
        },
      },
    },
  })
  validateMovements(
    @Body() request: ValidationRequestDto,
  ): ValidationSuccessResponse | ValidationFailureResponse {
    const result = this.movementsService.validateMovements(request);

    // The global exception filter will handle the HttpException
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
