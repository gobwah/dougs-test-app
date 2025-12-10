import { HttpException, HttpStatus } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';
import { AllExceptionsFilter } from '../../../src/common/filters/http-exception.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    mockRequest = {
      method: 'POST',
      url: '/movements/validation',
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
  });

  describe('HttpException handling', () => {
    it('should handle custom response with message and reasons', () => {
      const customResponse = {
        message: 'Validation failed',
        reasons: [{ type: 'BALANCE_MISMATCH', message: 'Test error' }],
      };
      const exception = new HttpException(
        customResponse,
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation failed',
          reasons: customResponse.reasons,
          statusCode: HttpStatus.BAD_REQUEST,
          timestamp: expect.any(String),
          path: '/movements/validation',
          method: 'POST',
        }),
      );
    });

    it('should handle standard NestJS validation error', () => {
      const validationError = {
        message: ['field must be a string'],
        error: 'Bad Request',
      };
      const exception = new HttpException(
        validationError,
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['field must be a string'],
          error: 'Bad Request',
          timestamp: expect.any(String),
          path: '/movements/validation',
          method: 'POST',
        }),
      );
    });

    it('should handle string response', () => {
      const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          message: ['Not Found'],
          timestamp: expect.any(String),
        }),
      );
    });

    it('should handle 500 errors with error logging', () => {
      const exception = new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      const loggerSpy = jest.spyOn(filter['logger'], 'error');

      filter.catch(exception, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });

    it('should handle 4xx errors with warning logging', () => {
      const exception = new HttpException(
        'Bad Request',
        HttpStatus.BAD_REQUEST,
      );

      const loggerSpy = jest.spyOn(filter['logger'], 'warn');

      filter.catch(exception, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Error handling', () => {
    it('should handle standard Error instances', () => {
      const error = new Error('Something went wrong');

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: ['Something went wrong'],
          error: 'Internal Server Error',
          timestamp: expect.any(String),
        }),
      );
    });

    it('should handle unknown error types', () => {
      const unknownError = { someProperty: 'value' };

      filter.catch(unknownError, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: ['An unexpected error occurred'],
          error: 'Internal Server Error',
        }),
      );
    });

    it('should handle Error with stack trace', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';

      const loggerSpy = jest.spyOn(filter['logger'], 'error');

      filter.catch(error, mockArgumentsHost);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('POST /movements/validation'),
        'Error: Test error\n    at test.js:1:1',
      );
    });
  });

  describe('Message array handling', () => {
    it('should handle array messages correctly', () => {
      const validationError = {
        message: ['Error 1', 'Error 2'],
        error: 'Bad Request',
      };
      const exception = new HttpException(
        validationError,
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: ['Error 1', 'Error 2'],
        }),
      );
    });

    it('should convert string message to array', () => {
      const exception = new HttpException(
        'Single error',
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: ['Single error'],
        }),
      );
    });
  });
});
