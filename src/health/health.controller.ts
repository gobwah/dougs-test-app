import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: "Vérifier l'état de l'application",
    description:
      "Retourne le statut de santé de l'application avec son temps de fonctionnement.",
  })
  @ApiResponse({
    status: 200,
    description: "Application en cours d'exécution",
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00.000Z',
        },
        uptime: {
          type: 'number',
          description: 'Temps de fonctionnement en secondes',
          example: 123.456,
        },
      },
    },
  })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
