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
import { MovementsService } from './movements.service';
import { ValidationRequestDto } from './dto/requestDto';
import {
  ValidationFailureResponse,
  ValidationSuccessResponse,
} from './dto/responseDto';

@ApiTags('movements')
@Controller('movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

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
    description: 'Validation réussie',
    type: ValidationSuccessResponse,
  })
  @ApiBadRequestResponse({
    description: 'Validation échouée avec détails des erreurs',
    type: ValidationFailureResponse,
  })
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
