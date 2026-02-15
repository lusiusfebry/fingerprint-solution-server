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
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AttendanceLogsService } from './attendance-logs.service';
import { AttendanceLogFilterDto } from './dto/attendance-log-filter.dto';
import { AttendanceLogResponseDto } from './dto/attendance-log-response.dto';
import { AttendanceSummaryDto } from './dto/attendance-summary.dto';
import { ExportFilterDto } from './dto/export-filter.dto';
import { AttendanceCalculationFilterDto } from './dto/attendance-calculation-filter.dto';

@ApiTags('Attendance')
@Controller('attendance')
@ApiBearerAuth('JWT-auth')
export class AttendanceLogsController {
  constructor(private readonly attendanceLogsService: AttendanceLogsService) {}

  @Get('logs')
  @ApiOperation({
    summary: 'Ambil log absensi',
    description:
      'Mendapatkan daftar log absensi (pukulan mesin) dengan fitur filter dan paginasi.',
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar log absensi berhasil diambil',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() filter: AttendanceLogFilterDto) {
    return this.attendanceLogsService.findAll(filter);
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Ambil ringkasan statistik',
    description:
      'Mendapatkan statistik ringkas kehadiran (jumlah hadir, terlambat, dll) dalam rentang waktu tertentu.',
  })
  @ApiResponse({
    status: 200,
    description: 'Ringkasan statistik berhasil diambil',
    type: AttendanceSummaryDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({
    summary: 'Export log ke Excel',
    description: 'Mengunduh data log absensi dalam format file Excel (.xlsx).',
  })
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @ApiResponse({ status: 200, description: 'File Excel berhasil di-generate' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async export(@Query() filter: ExportFilterDto, @Res() res: Response) {
    const buffer = await this.attendanceLogsService.exportToExcel(filter);
    const date = new Date().toISOString().split('T')[0];
    const filename = filter.filename || `attendance-logs-${date}.xlsx`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get('logs/:id')
  @ApiOperation({
    summary: 'Ambil detail log',
    description:
      'Mendapatkan informasi detail dari satu entri log absensi berdasarkan ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID Log Absensi (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Detail log absensi ditemukan',
    type: AttendanceLogResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Log tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findById(@Param('id') id: string) {
    return this.attendanceLogsService.findById(id);
  }

  @Get('calculate')
  @ApiOperation({
    summary: 'Kalkulasi kehadiran',
    description:
      'Melakukan perhitungan kehadiran berdasarkan log mesin dan aturan shift kerja.',
  })
  @ApiResponse({
    status: 200,
    description: 'Hasil kalkulasi berhasil diperoleh',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async calculateAttendance(@Query() filter: AttendanceCalculationFilterDto) {
    return this.attendanceLogsService.calculateAttendance(filter);
  }

  @Get('summary-report')
  @ApiOperation({
    summary: 'Ambil laporan ringkasan',
    description:
      'Mendapatkan laporan ringkas kehadiran per karyawan untuk periode tertentu.',
  })
  @ApiResponse({
    status: 200,
    description: 'Laporan ringkasan berhasil diambil',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAttendanceSummary(@Query() filter: AttendanceCalculationFilterDto) {
    return this.attendanceLogsService.getAttendanceSummary(filter);
  }
}
