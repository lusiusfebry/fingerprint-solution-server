import { ApiProperty } from '@nestjs/swagger';
import { AttendanceLogResponseDto } from './attendance-log-response.dto';

export class AttendanceSummaryDto {
  @ApiProperty()
  totalLogs: number;

  @ApiProperty()
  todayLogs: number;

  @ApiProperty()
  uniqueEmployeesToday: number;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  byDevice: { deviceId: string; deviceName: string; count: number }[];

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  byVerifyType: { type: number; label: string; count: number }[];

  @ApiProperty({ type: [AttendanceLogResponseDto] })
  recentLogs: AttendanceLogResponseDto[];

  @ApiProperty()
  dateRange: { start: Date; end: Date };
}
