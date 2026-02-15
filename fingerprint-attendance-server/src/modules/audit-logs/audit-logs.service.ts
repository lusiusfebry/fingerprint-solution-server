import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../database/entities/audit-log.entity';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async createLog(data: Partial<AuditLog>): Promise<AuditLog> {
    const log = this.auditLogRepository.create(data);
    return this.auditLogRepository.save(log);
  }

  async findAll(query: AuditLogQueryDto): Promise<AuditLog[]> {
    const builder = this.auditLogRepository.createQueryBuilder('log');
    builder.leftJoinAndSelect('log.user', 'user');

    if (query.user_id) {
      builder.andWhere('log.user_id = :userId', { userId: query.user_id });
    }
    if (query.action) {
      builder.andWhere('log.action = :action', { action: query.action });
    }
    if (query.resource) {
      builder.andWhere('log.resource = :resource', {
        resource: query.resource,
      });
    }

    // Pagination
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 10;
    builder.skip((page - 1) * limit).take(limit);

    builder.orderBy('log.timestamp', 'DESC');

    return builder.getMany();
  }
}
