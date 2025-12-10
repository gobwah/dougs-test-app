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
    examples: {
      healthy: {
        summary: "Application saine - L'application fonctionne correctement",
        value: {
          status: 'ok',
          timestamp: '2024-01-15T10:30:00.000Z',
          uptime: 123.456,
        },
      },
    },
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok',
          description: "Statut de santé de l'application",
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00.000Z',
          description: 'Horodatage de la réponse',
        },
        uptime: {
          type: 'number',
          description: 'Temps de fonctionnement en secondes',
          example: 123.456,
        },
      },
      required: ['status', 'timestamp', 'uptime'],
    },
  })
  @ApiResponse({
    status: 503,
    description:
      "Service indisponible - L'application n'est pas disponible (cas futur avec health checks avancés)",
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'error',
        },
        message: {
          type: 'string',
          example: 'Service temporarily unavailable',
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
