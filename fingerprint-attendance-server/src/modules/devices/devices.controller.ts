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
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @ApiOperation({ summary: 'Register device baru' })
  @UsePipes(ValidationPipe)
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Ambil semua devices' })
  findAll() {
    return this.devicesService.findAll();
  }

  @Post('scan')
  @ApiOperation({ summary: 'Auto-detect devices in network' })
  @ApiQuery({
    name: 'subnet',
    required: false,
    description: 'CIDR subnet (e.g. 192.168.1.0/24)',
  })
  scanNetwork(@Query('subnet') subnet?: string) {
    return this.devicesService.scanNetwork(subnet);
  }

  @Post('test-connection')
  @ApiOperation({ summary: 'Test connection parameters' })
  testConnectionParams(@Body() dto: TestConnectionDto) {
    return this.devicesService.testConnectionByParams(dto.ip_address, dto.port);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a single device' })
  @ApiParam({ name: 'id', type: 'string' })
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update existing device' })
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.devicesService.update(id, updateDeviceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a device' })
  remove(@Param('id') id: string) {
    return this.devicesService.remove(id);
  }

  @Post(':id/test')
  @ApiOperation({ summary: 'Test connection to registered device' })
  testConnection(@Param('id') id: string) {
    return this.devicesService.testConnection(id);
  }

  @Post(':id/restart')
  @ApiOperation({ summary: 'Restart device' })
  restartDevice(@Param('id') id: string) {
    return this.devicesService.restartDevice(id);
  }

  @Post(':id/sync')
  @ApiOperation({ summary: 'Trigger manual sync' })
  syncDevice(@Param('id') id: string, @Body() syncDto: SyncDeviceDto) {
    return this.devicesService.syncDevice(id, syncDto);
  }

  @Get(':id/info')
  @ApiOperation({ summary: 'Get live device info' })
  getDeviceInfo(@Param('id') id: string) {
    return this.devicesService.getDeviceInfo(id);
  }
}
