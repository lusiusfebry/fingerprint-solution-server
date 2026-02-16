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

  async findAll(
    query: AuditLogQueryDto,
  ): Promise<{ data: AuditLog[]; pagination: any }> {
    const builder = this.auditLogRepository.createQueryBuilder('log');
    builder.leftJoinAndSelect('log.user', 'user');

    if (query.user_id) {
      builder.andWhere('log.user_id = :userId', { userId: query.user_id });
    }
    if (query.action) {
      builder.andWhere('log.action ILIKE :action', {
        action: `%${query.action}%`,
      });
    }
    if (query.resource) {
      builder.andWhere('log.resource = :resource', {
        resource: query.resource,
      });
    }
    if (query.module) {
      builder.andWhere('log.module = :module', {
        module: query.module,
      });
    }
    if (query.severity) {
      builder.andWhere('log.severity = :severity', {
        severity: query.severity,
      });
    }
    if (query.search) {
      builder.andWhere(
        '(log.description ILIKE :search OR log.user_name ILIKE :search OR log.action ILIKE :search OR user.full_name ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }
    if (query.startDate) {
      builder.andWhere('log.timestamp >= :startDate', {
        startDate: new Date(query.startDate),
      });
    }
    if (query.endDate) {
      builder.andWhere('log.timestamp <= :endDate', {
        endDate: new Date(query.endDate),
      });
    }

    // Pagination
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 10;

    const [data, totalItems] = await builder
      .orderBy('log.timestamp', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit,
      },
    };
  }
}
