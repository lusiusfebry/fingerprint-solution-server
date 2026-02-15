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
  ApiBody,
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
  @ApiBody({
    type: CreateDeviceDto,
    examples: {
      valid: {
        value: {
          name: 'Pintu Utama Lobby',
          serial_number: 'SN12345678',
          ip_address: '192.168.1.201',
          port: 80,
          location: 'Lobby Lantai 1',
          comm_key: '0',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Perangkat berhasil terdaftar',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Pintu Utama Lobby',
        serial_number: 'SN12345678',
        status: 'offline',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Data tidak valid atau IP sudah terdaftar',
    content: {
      'application/json': {
        example: {
          message: 'IP address already registered',
          errors: ['ip_address must be unique'],
        },
      },
    },
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
    content: {
      'application/json': {
        example: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Pintu Utama Lobby',
            serial_number: 'SN12345678',
            ip_address: '192.168.1.201',
            status: 'online',
          },
        ],
      },
    },
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
  @ApiResponse({
    status: 200,
    description: 'Pemindaian selesai',
    content: {
      'application/json': {
        example: {
          message: 'Scanning finished',
          found: [
            {
              ip: '192.168.1.201',
              port: 80,
              sn: 'SN12345678',
            },
          ],
        },
      },
    },
  })
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
  @ApiBody({ type: TestConnectionDto })
  @ApiResponse({
    status: 200,
    description: 'Hasil tes koneksi',
    content: {
      'application/json': {
        example: {
          success: true,
          message: 'Connected successfully',
        },
      },
    },
  })
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
    content: {
      'application/json': {
        example: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Pintu Utama Lobby',
          serial_number: 'SN12345678',
          ip_address: '192.168.1.201',
          status: 'online',
          location: 'Lobby Lantai 1',
        },
      },
    },
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
  @ApiBody({ type: UpdateDeviceDto })
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
  @ApiResponse({
    status: 200,
    description: 'Hasil tes koneksi',
    content: {
      'application/json': {
        example: { success: true, message: 'Device is reachable' },
      },
    },
  })
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
  @ApiResponse({
    status: 200,
    description: 'Perintah restart terkirim',
    content: {
      'application/json': {
        example: { success: true, message: 'Restart command sent' },
      },
    },
  })
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
  @ApiBody({ type: SyncDeviceDto })
  @ApiResponse({
    status: 200,
    description: 'Proses sinkronisasi dimulai',
    content: {
      'application/json': {
        example: { jobId: 'job_uuid', status: 'queued' },
      },
    },
  })
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
    content: {
      'application/json': {
        example: {
          userCount: 150,
          fingerCount: 300,
          logCount: 1050,
          deviceName: 'X105-D',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getDeviceInfo(@Param('id') id: string) {
    return this.devicesService.getDeviceInfo(id);
  }
}
