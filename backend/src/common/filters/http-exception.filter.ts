// src/common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ResponseDto } from '../dto/response.dto';
import { LoggerService } from '../logger/logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Determine the status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Determine the error message
    let message = 'An unexpected error occurred';
    let stack: string | undefined;
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || message;
    } else if (exception instanceof Error) {
      message = exception.message;
      stack = exception.stack;
    }

    // Log the error
    this.logger.error(
      {
        correlationId: request.headers['x-correlation-id'],
      },  
      `Error: ${message} - Method: ${request.method} - URL: ${request.url} - Status: ${status}`,
      undefined,
      'HttpExceptionFilter',
    );

    // Wrap the error response in ResponseDto
    const errorResponse = new ResponseDto<string>(message, status, undefined);
    response.status(status).json(errorResponse);
  }
}