import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { SyncDeviceDto } from './dto/sync-device.dto';
import { TestConnectionDto } from './dto/test-connection.dto';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Devices')
@Controller('devices')
@ApiBearerAuth('JWT-auth')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @ApiOperation({
    summary: 'Daftarkan perangkat baru',
    description:
      'Menambahkan mesin fingerprint baru ke dalam sistem untuk dimonitor dan disinkronisasi.',
  })
  @ApiResponse({ status: 201, description: 'Perangkat berhasil terdaftar' })
  @ApiResponse({
    status: 400,
    description: 'Data tidak valid atau IP sudah terdaftar',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UsePipes(ValidationPipe)
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Ambil semua perangkat',
    description:
      'Mendapatkan daftar seluruh mesin fingerprint yang terdaftar di sistem.',
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar perangkat berhasil diambil',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.devicesService.findAll();
  }

  @Post('scan')
  @ApiOperation({
    summary: 'Auto-detect perangkat di jaringan',
    description:
      'Melakukan pemindaian (scanning) pada subnet tertentu untuk mendeteksi mesin fingerprint yang aktif.',
  })
  @ApiQuery({
    name: 'subnet',
    required: false,
    description: 'Subnet CIDR (contoh: 192.168.1.0/24)',
    example: '192.168.1.0/24',
  })
  @ApiResponse({ status: 200, description: 'Pemindaian selesai' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  scanNetwork(@Query('subnet') subnet?: string) {
    return this.devicesService.scanNetwork(subnet);
  }

  @Post('test-connection')
  @ApiOperation({
    summary: 'Tes koneksi parameter',
    description:
      'Menguji konektivitas ke mesin fingerprint sebelum didaftarkan.',
  })
  @ApiResponse({ status: 200, description: 'Hasil tes koneksi' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  testConnectionParams(@Body() dto: TestConnectionDto) {
    return this.devicesService.testConnectionByParams(dto.ip_address, dto.port);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Ambil detail perangkat',
    description:
      'Mendapatkan informasi detail dari satu mesin fingerprint berdasarkan ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID Perangkat (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Data perangkat berhasil ditemukan',
  })
  @ApiResponse({ status: 404, description: 'Perangkat tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update perangkat',
    description:
      'Memperbarui informasi konfigurasi mesin fingerprint yang sudah terdaftar.',
  })
  @ApiParam({ name: 'id', description: 'ID Perangkat (UUID)' })
  @ApiResponse({ status: 200, description: 'Perangkat berhasil diperbarui' })
  @ApiResponse({ status: 404, description: 'Perangkat tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.devicesService.update(id, updateDeviceDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Hapus perangkat',
    description: 'Menghapus mesin fingerprint dari sistem.',
  })
  @ApiParam({ name: 'id', description: 'ID Perangkat (UUID)' })
  @ApiResponse({ status: 200, description: 'Perangkat berhasil dihapus' })
  @ApiResponse({ status: 404, description: 'Perangkat tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.devicesService.remove(id);
  }

  @Post(':id/test')
  @ApiOperation({
    summary: 'Tes koneksi perangkat terdaftar',
    description:
      'Menguji apakah mesin yang sudah terdaftar masih dapat dijangkau di jaringan.',
  })
  @ApiParam({ name: 'id', description: 'ID Perangkat (UUID)' })
  @ApiResponse({ status: 200, description: 'Hasil tes koneksi' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  testConnection(@Param('id') id: string) {
    return this.devicesService.testConnection(id);
  }

  @Post(':id/restart')
  @ApiOperation({
    summary: 'Restart perangkat',
    description:
      'Mengirimkan perintah reboot/restart ke mesin fingerprint secara remote.',
  })
  @ApiParam({ name: 'id', description: 'ID Perangkat (UUID)' })
  @ApiResponse({ status: 200, description: 'Perintah restart terkirim' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  restartDevice(@Param('id') id: string) {
    return this.devicesService.restartDevice(id);
  }

  @Post(':id/sync')
  @ApiOperation({
    summary: 'Sinkronisasi manual',
    description:
      'Memicu proses sinkronisasi data (log/karyawan) secara paksa ke mesin tertentu.',
  })
  @ApiParam({ name: 'id', description: 'ID Perangkat (UUID)' })
  @ApiResponse({ status: 200, description: 'Proses sinkronisasi dimulai' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  syncDevice(@Param('id') id: string, @Body() syncDto: SyncDeviceDto) {
    return this.devicesService.syncDevice(id, syncDto);
  }

  @Get(':id/info')
  @ApiOperation({
    summary: 'Ambil live info perangkat',
    description:
      'Mendapatkan informasi status real-time langsung dari mesin (jumlah log, user, dll).',
  })
  @ApiParam({ name: 'id', description: 'ID Perangkat (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Informasi device berhasil diambil',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getDeviceInfo(@Param('id') id: string) {
    return this.devicesService.getDeviceInfo(id);
  }
}
