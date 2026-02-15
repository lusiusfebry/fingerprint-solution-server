import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  Header,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { AttendanceLogsService } from './attendance-logs.service';
import { AttendanceLogFilterDto } from './dto/attendance-log-filter.dto';
import { AttendanceLogResponseDto } from './dto/attendance-log-response.dto';
import { AttendanceSummaryDto } from './dto/attendance-summary.dto';
import { ExportFilterDto } from './dto/export-filter.dto';
import { AttendanceCalculationFilterDto } from './dto/attendance-calculation-filter.dto';

@ApiTags('Attendance Logs')
@Controller('attendance')
export class AttendanceLogsController {
  constructor(private readonly attendanceLogsService: AttendanceLogsService) {}

  @Get('logs')
  @ApiOperation({ summary: 'Get paginated attendance logs' })
  @ApiResponse({ status: 200, description: 'Return list of logs' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() filter: AttendanceLogFilterDto) {
    return this.attendanceLogsService.findAll(filter);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get attendance statistics summary' })
  @ApiResponse({
    status: 200,
    description: 'Return summary stats',
    type: AttendanceSummaryDto,
  })
  async getSummary(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceLogsService.getSummary(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('export')
  @ApiOperation({ summary: 'Export attendance logs to Excel' })
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @UsePipes(new ValidationPipe({ transform: true }))
  async export(@Query() filter: ExportFilterDto, @Res() res: Response) {
    const buffer = await this.attendanceLogsService.exportToExcel(filter);
    const date = new Date().toISOString().split('T')[0];
    const filename = filter.filename || `attendance-logs-${date}.xlsx`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get('logs/:id')
  @ApiOperation({ summary: 'Get attendance log by ID' })
  @ApiParam({ name: 'id', description: 'Attendance log UUID' })
  @ApiResponse({
    status: 200,
    description: 'Return log detail',
    type: AttendanceLogResponseDto,
  })
  async findById(@Param('id') id: string) {
    return this.attendanceLogsService.findById(id);
  }
  @Get('calculate')
  @ApiOperation({ summary: 'Calculate attendance with shift logic' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async calculateAttendance(@Query() filter: AttendanceCalculationFilterDto) {
    return this.attendanceLogsService.calculateAttendance(filter);
  }

  @Get('summary-report')
  @ApiOperation({ summary: 'Get attendance summary report' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAttendanceSummary(@Query() filter: AttendanceCalculationFilterDto) {
    return this.attendanceLogsService.getAttendanceSummary(filter);
  }
}
