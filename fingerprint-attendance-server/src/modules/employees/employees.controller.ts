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
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly shiftsService: ShiftsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tambah karyawan baru' })
  @ApiResponse({
    status: 201,
    description: 'Karyawan berhasil ditambahkan',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Data tidak valid atau NIK sudah ada',
  })
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua data karyawan' })
  @ApiResponse({
    status: 200,
    description: 'List karyawan',
    type: [EmployeeResponseDto],
  })
  async findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ambil detail karyawan by ID' })
  @ApiResponse({
    status: 200,
    description: 'Detail karyawan',
    type: EmployeeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Karyawan tidak ditemukan' })
  async findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update data karyawan' })
  @ApiResponse({
    status: 200,
    description: 'Karyawan berhasil diupdate',
    type: EmployeeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Karyawan tidak ditemukan' })
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus karyawan' })
  @ApiResponse({ status: 204, description: 'Karyawan berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Karyawan tidak ditemukan' })
  async remove(@Param('id') id: string) {
    await this.employeesService.remove(id);
  }

  @Post(':id/fingerprint')
  @ApiOperation({ summary: 'Upload template sidik jari karyawan' })
  @ApiResponse({ status: 201, description: 'Template berhasil diupload' })
  @ApiResponse({
    status: 400,
    description: 'Template sudah ada atau data tidak valid',
  })
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
  @ApiOperation({ summary: 'Import karyawan dari Excel' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Import berhasil' })
  @ApiResponse({ status: 400, description: 'File tidak valid' })
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new BadRequestException('File Excel wajib diunggah');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.employeesService.importFromExcel(file);
    return result as unknown;
  }

  @Post(':id/shifts')
  @ApiOperation({ summary: 'Assign shift to employee' })
  @ApiResponse({ status: 201, description: 'Shift assigned successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data or shift' })
  async assignShift(
    @Param('id') employeeId: string,
    @Body() dto: AssignShiftDto,
  ) {
    return this.shiftsService.assignShiftToEmployee(employeeId, dto);
  }

  @Delete(':id/shifts/:shiftId')
  @ApiOperation({ summary: 'Remove shift assignment from employee' })
  @ApiResponse({ status: 200, description: 'Shift assignment removed' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  async removeShift(
    @Param('id') employeeId: string,
    @Param('shiftId') shiftId: string,
  ) {
    return this.shiftsService.removeShiftFromEmployee(employeeId, shiftId);
  }
}
