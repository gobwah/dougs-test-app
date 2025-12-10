import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
}

interface CustomResponse extends Record<string, unknown> {
  message: string;
  reasons?: unknown;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, customResponse, message, error } = this.extractErrorInfo(
      exception,
      request,
    );

    if (customResponse) {
      this.logError(exception, request, status);
      response.status(status).json(customResponse);
      return;
    }

    const errorResponse = this.buildErrorResponse(
      status,
      message,
      error,
      request,
    );
    this.logError(exception, request, status);
    response.status(status).json(errorResponse);
  }

  private extractErrorInfo(
    exception: unknown,
    request: Request,
  ): {
    status: number;
    customResponse: CustomResponse | null;
    message: string | string[];
    error: string | undefined;
  } {
    if (exception instanceof HttpException) {
      return this.extractHttpExceptionInfo(exception, request);
    }

    if (exception instanceof Error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        customResponse: null,
        message: exception.message,
        error: 'Internal Server Error',
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      customResponse: null,
      message: 'An unexpected error occurred',
      error: 'Internal Server Error',
    };
  }

  private extractHttpExceptionInfo(
    exception: HttpException,
    request: Request,
  ): {
    status: number;
    customResponse: CustomResponse | null;
    message: string | string[];
    error: string | undefined;
  } {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (this.isCustomResponseObject(exceptionResponse)) {
      const customResponse = this.buildCustomResponse(
        exceptionResponse,
        status,
        request,
      );
      return {
        status,
        customResponse,
        message: exceptionResponse.message,
        error: undefined,
      };
    }

    if (this.isStandardErrorObject(exceptionResponse)) {
      return {
        status,
        customResponse: null,
        message:
          (exceptionResponse.message as string | string[]) || exception.message,
        error: exceptionResponse.error as string | undefined,
      };
    }

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exception.message;

    return {
      status,
      customResponse: null,
      message,
      error: undefined,
    };
  }

  private isCustomResponseObject(
    response: unknown,
  ): response is CustomResponse {
    return (
      typeof response === 'object' &&
      response !== null &&
      !Array.isArray(response) &&
      'message' in response &&
      'reasons' in response
    );
  }

  private isStandardErrorObject(
    response: unknown,
  ): response is Record<string, unknown> {
    return (
      typeof response === 'object' &&
      response !== null &&
      !Array.isArray(response) &&
      !('reasons' in response)
    );
  }

  private buildCustomResponse(
    responseObj: CustomResponse,
    status: number,
    request: Request,
  ): CustomResponse {
    return {
      ...responseObj,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };
  }

  private buildErrorResponse(
    status: number,
    message: string | string[],
    error: string | undefined,
    request: Request,
  ): ErrorResponse {
    return {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: Array.isArray(message) ? message : [message],
      ...(error && { error }),
    };
  }

  private logError(exception: unknown, request: Request, status: number): void {
    const logContext = `${request.method} ${request.url} - ${status}`;
    const errorDetails = this.getErrorDetails(exception);

    if (status >= 500) {
      this.logger.error(logContext, errorDetails);
    } else {
      this.logger.warn(logContext);
    }
  }

  private getErrorDetails(exception: unknown): string {
    if (exception instanceof Error) {
      return exception.stack || exception.message;
    }
    return JSON.stringify(exception);
  }
}
