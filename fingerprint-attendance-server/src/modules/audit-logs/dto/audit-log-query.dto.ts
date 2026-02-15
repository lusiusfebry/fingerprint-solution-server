import { IsOptional, IsString } from 'class-validator';

export class AuditLogQueryDto {
  @IsOptional()
  @IsString()
  user_id?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  resource?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
