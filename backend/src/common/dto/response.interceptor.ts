// src/common/interceptors/response.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from './response.dto';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ResponseDto<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        const statusCode = response.statusCode || HttpStatus.OK;
        const method = request.method;
        let message = 'Success';
        switch (method) {
          case 'POST':
            message = 'Resource created successfully';
            break;
          case 'PUT':
            message = 'Resource updated successfully';
            break;
          case 'DELETE':
            message = 'Resource deleted successfully';
            break;
          case 'GET':
            message = 'Resource retrieved successfully';
            break;
        }

        if (data && data instanceof ResponseDto) {
          return data;
        }

        return new ResponseDto<T>(message, statusCode, data);
      }),
    );
  }
}