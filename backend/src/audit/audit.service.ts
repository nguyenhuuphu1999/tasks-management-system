import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Audit } from './audit.entity';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  public constructor(
    @InjectRepository(Audit)
    private auditRepository: Repository<Audit>,
  ) {}

  public async logAudit(
    input: {
      user: { id: string; username: string } | null,
      method: string,
      url: string,
      requestBody: any,
      statusCode: number,
      ipAddress: string,
      correlationId?: string
    }
  ): Promise<void> {
    try {
      const audit = this.auditRepository.create({
        userId: input.user?.id,
        username: input.user?.username,
        method: input.method,
        url: input.url,
        requestBody: input.requestBody,
        statusCode: input.statusCode,
        ipAddress: input.ipAddress,
        createdAt: new Date(),
        correlationId: input.correlationId,
      });

      await this.auditRepository.save(audit);

      // Log to console for debugging
      this.logger.log(
        `CorrelationId: ${input.correlationId} - Audit: ${input.method} ${input.url} - Status: ${input.statusCode} - User: ${
          input.user?.username || 'Anonymous'
        } - IP: ${input.ipAddress}`,
      );
    } catch (error) {
      this.logger.error(`Failed to save audit log: ${error.message}`, error.stack);
    }
  }
}