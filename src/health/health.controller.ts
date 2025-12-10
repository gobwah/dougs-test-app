import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Check application status',
    description: 'Returns the application health status with its uptime.',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is running',
    examples: {
      healthy: {
        summary: 'Healthy application - The application is working correctly',
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
          description: 'Application health status',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00.000Z',
          description: 'Response timestamp',
        },
        uptime: {
          type: 'number',
          description: 'Uptime in seconds',
          example: 123.456,
        },
      },
      required: ['status', 'timestamp', 'uptime'],
    },
  })
  @ApiResponse({
    status: 503,
    description:
      'Service unavailable - The application is not available (future case with advanced health checks)',
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
