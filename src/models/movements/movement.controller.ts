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
    summary: 'Valider des mouvements bancaires',
    description:
      'Valide une liste de mouvements bancaires en les comparant avec des points de contrôle (soldes). Détecte les incohérences, doublons et anomalies.',
  })
  @ApiBody({
    type: ValidationRequestDto,
    description:
      'Données de validation contenant les mouvements et les balances',
    examples: {
      valid: {
        summary: 'Exemple de validation réussie',
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
        summary: 'Exemple avec erreur de balance',
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
    description: 'Validation réussie - Tous les mouvements sont valides',
    type: ValidationSuccessResponse,
    examples: {
      success: {
        summary:
          'Validation réussie - Exemple de réponse lorsque tous les mouvements sont valides',
        value: {
          message: 'Accepted',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Validation échouée - Une ou plusieurs erreurs ont été détectées',
    type: ValidationFailureResponse,
    examples: {
      balanceMismatch: {
        summary:
          'Erreur de déséquilibre de solde - Le solde calculé ne correspond pas au solde du point de contrôle',
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
          'Transactions dupliquées détectées - Des transactions avec la même date, le même montant et des libellés similaires ont été détectées',
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
          'Transactions après le dernier point de contrôle - Des mouvements existent après le dernier point de contrôle, indiquant possiblement des transactions manquantes',
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
          "Ordre chronologique invalide - Les points de contrôle ne sont pas dans l'ordre chronologique",
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
          "Plusieurs erreurs détectées - Exemple avec plusieurs types d'erreurs simultanées",
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
      "Requête invalide - Erreurs de validation des données d'entrée (format de date, montants invalides, etc.)",
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
      'Trop de requêtes - Limite de rate limiting atteinte. Réessayez plus tard.',
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
    description:
      "Erreur serveur interne - Une erreur inattendue s'est produite",
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
