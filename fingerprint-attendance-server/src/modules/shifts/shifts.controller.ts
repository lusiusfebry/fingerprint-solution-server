import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ShiftsService } from './shifts.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@ApiTags('Shifts')
@Controller('shifts')
@ApiBearerAuth('JWT-auth')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post()
  @ApiOperation({
    summary: 'Buat shift baru',
    description: 'Menambahkan jadwal kerja baru ke dalam sistem konfigurasi.',
  })
  @ApiResponse({ status: 201, description: 'Shift berhasil dibuat' })
  @ApiResponse({ status: 400, description: 'Data tidak valid' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createShiftDto: CreateShiftDto) {
    return this.shiftsService.create(createShiftDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Ambil semua shift',
    description: 'Mendapatkan daftar seluruh jadwal kerja yang tersedia.',
  })
  @ApiQuery({
    name: 'active',
    required: false,
    type: Boolean,
    description: 'Filter berdasarkan status aktif (true/false)',
  })
  @ApiResponse({ status: 200, description: 'Daftar shift berhasil diambil' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query('active') active?: string) {
    return this.shiftsService.findAll(active === 'true');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Ambil detail shift',
    description:
      'Mendapatkan informasi detail tentang konfigurasi satu shift berdasar ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID Shift (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Data shift ditemukan' })
  @ApiResponse({ status: 404, description: 'Shift tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.shiftsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update shift',
    description: 'Memperbarui parameter jadwal kerja yang sudah ada.',
  })
  @ApiParam({ name: 'id', description: 'ID Shift (UUID)' })
  @ApiResponse({ status: 200, description: 'Shift berhasil diperbarui' })
  @ApiResponse({ status: 404, description: 'Shift tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateShiftDto: UpdateShiftDto) {
    return this.shiftsService.update(id, updateShiftDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Hapus atau nonaktifkan shift',
    description:
      'Menghapus data shift dari sistem (catatan: mungkin hanya deaktif jika ada dependensi).',
  })
  @ApiParam({ name: 'id', description: 'ID Shift (UUID)' })
  @ApiResponse({ status: 200, description: 'Shift berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Shift tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.shiftsService.remove(id);
  }

  @Get(':id/employees')
  @ApiOperation({
    summary: 'Ambil karyawan per shift',
    description: 'Mendapatkan daftar karyawan yang ditugaskan pada shift ini.',
  })
  @ApiParam({ name: 'id', description: 'ID Shift (UUID)' })
  @ApiResponse({ status: 200, description: 'Daftar karyawan ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getEmployees(@Param('id') id: string) {
    return this.shiftsService.getEmployeesByShift(id);
  }
}
