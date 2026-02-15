import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UploadFingerprintDto } from './dto/upload-fingerprint.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { ShiftsService } from '../shifts/shifts.service';
import { AssignShiftDto } from '../shifts/dto/assign-shift.dto';

@ApiTags('Employees')
@Controller('api/employees')
@ApiBearerAuth('JWT-auth')
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly shiftsService: ShiftsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Tambah karyawan baru',
    description: 'Mendaftarkan karyawan baru ke dalam sistem basis data.',
  })
  @ApiResponse({
    status: 201,
    description: 'Karyawan berhasil ditambahkan',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Data tidak valid atau NIK sudah terdaftar',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Ambil semua data karyawan',
    description: 'Mendapatkan daftar lengkap profil karyawan yang terdaftar.',
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar profil karyawan berhasil diambil',
    type: [EmployeeResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Ambil detail karyawan',
    description:
      'Mendapatkan informasi profil lengkap satu karyawan berdasarkan ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID Karyawan (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Profil karyawan ditemukan',
    type: EmployeeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Karyawan tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update data karyawan',
    description: 'Memperbarui informasi profil karyawan yang sudah ada.',
  })
  @ApiParam({ name: 'id', description: 'ID Karyawan (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Data karyawan berhasil diperbarui',
    type: EmployeeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Karyawan tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Hapus karyawan',
    description: 'Menghapus data karyawan secara permanen dari sistem.',
  })
  @ApiParam({ name: 'id', description: 'ID Karyawan (UUID)' })
  @ApiResponse({ status: 204, description: 'Karyawan berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Karyawan tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id') id: string) {
    await this.employeesService.remove(id);
  }

  @Post(':id/fingerprint')
  @ApiOperation({
    summary: 'Upload sidik jari',
    description:
      'Mengunggah template sidik jari karyawan untuk kemudian dikirimkan ke mesin.',
  })
  @ApiParam({ name: 'id', description: 'ID Karyawan (UUID)' })
  @ApiResponse({
    status: 201,
    description: 'Template sidik jari berhasil diunggah',
  })
  @ApiResponse({
    status: 400,
    description: 'Template sudah ada atau format data tidak valid',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadFingerprint(
    @Param('id') id: string,
    @Body() uploadDto: UploadFingerprintDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.employeesService.uploadFingerprint(id, uploadDto);
    return result as unknown;
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Import dari Excel',
    description:
      'Mengunggah file Excel untuk mendaftarkan banyak karyawan sekaligus.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File Excel (.xlsx)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Proses import berhasil diselesaikan',
  })
  @ApiResponse({
    status: 400,
    description: 'File tidak ditemukan atau format tidak valid',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new BadRequestException('File Excel wajib diunggah');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.employeesService.importFromExcel(file);
    return result as unknown;
  }

  @Post(':id/shifts')
  @ApiOperation({
    summary: 'Assign shift ke karyawan',
    description:
      'Menentukan jadwal kerja (shift) tertentu untuk seorang karyawan.',
  })
  @ApiParam({ name: 'id', description: 'ID Karyawan (UUID)' })
  @ApiResponse({ status: 201, description: 'Shift berhasil ditetapkan' })
  @ApiResponse({
    status: 400,
    description: 'Data tidak valid atau shift tidak ditemukan',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async assignShift(
    @Param('id') employeeId: string,
    @Body() dto: AssignShiftDto,
  ) {
    return this.shiftsService.assignShiftToEmployee(employeeId, dto);
  }

  @Delete(':id/shifts/:shiftId')
  @ApiOperation({
    summary: 'Hapus penugasan shift',
    description: 'Menghapus keterkaitan penugasan shift dari seorang karyawan.',
  })
  @ApiParam({ name: 'id', description: 'ID Karyawan (UUID)' })
  @ApiParam({ name: 'shiftId', description: 'ID Shift (UUID)' })
  @ApiResponse({ status: 200, description: 'Penugasan shift berhasil dihapus' })
  @ApiResponse({
    status: 404,
    description: 'Karyawan atau penugasan tidak ditemukan',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeShift(
    @Param('id') employeeId: string,
    @Param('shiftId') shiftId: string,
  ) {
    return this.shiftsService.removeShiftFromEmployee(employeeId, shiftId);
  }
}
