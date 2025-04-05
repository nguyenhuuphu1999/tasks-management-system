import { Inject, Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

declare module 'express' {
  export interface Request {
    correlationId?: string;
  }
}

@Injectable({ scope: Scope.REQUEST })
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor(@Inject(REQUEST) private readonly request: Request) {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        new DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    });
  }

  private getCorrelationId(): string | undefined {
    return this.request?.correlationId;
  }
 
  public log(input: {correlationId?: string}, message: string, context?: string) {
    const correlationId = input.correlationId || this.getCorrelationId();
    this.logger.info(message, { context, correlationId });
  }

  public error(input: {correlationId?: string}, message: string, trace?: Error, context?: string) {
    const correlationId = input.correlationId || this.getCorrelationId();
    this.logger.error(`${message} - Error: ${JSON.stringify(trace)}`, { trace, context, correlationId });
  }

  public warn(input: {correlationId?: string},message: string, context?: string) {
    const correlationId = input.correlationId || this.getCorrelationId();
    this.logger.warn(message, { context, correlationId });
  }

  public debug(input: {correlationId?: string},message: string, context?: string) {
    const correlationId = input.correlationId || this.getCorrelationId();
    this.logger.debug(message, { context, correlationId });
  }

  public verbose(input: {correlationId?: string}, message: string, context?: string) {
    const correlationId = input.correlationId || this.getCorrelationId();
    this.logger.verbose(message, { context, correlationId });
  }
}