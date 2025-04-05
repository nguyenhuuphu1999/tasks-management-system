import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { Request, Response } from 'express';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(private auditService: AuditService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();

        const { method, url, body } = request;
        const user = request.user as { id: string; username: string } | undefined;
        const ipAddress = request.ip || request.connection.remoteAddress;

        // Log the request body only for POST, PUT, PATCH methods
        const requestBody = ['POST', 'PUT', 'PATCH'].includes(method) ? body : null;

        return next.handle().pipe(
            tap(() => {
                const statusCode = response.statusCode;
                this.auditService.logAudit(
                    {
                        correlationId: request.correlationId,
                        user: user || null,
                        method,
                        url,
                        requestBody,
                        statusCode,
                        ipAddress: ipAddress!,
                    }
                );
            }),
        );
    }
}