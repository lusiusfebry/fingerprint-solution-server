import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { TcpSocketService } from './services/tcp-socket.service';
import { FingerprintDeviceService } from './services/fingerprint-device.service';
import { Device } from '../../database/entities/device.entity';
import { DevicesGateway } from './devices.gateway';
import { DeviceMonitorService } from './services/device-monitor.service';
import { NetworkScannerService } from './services/network-scanner.service';

import { AttendanceLogsModule } from '../attendance-logs/attendance-logs.module';
import { EmployeesModule } from '../employees/employees.module';
import { SyncHistoryModule } from '../sync-history/sync-history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Device]),
    forwardRef(() => AttendanceLogsModule),
    forwardRef(() => EmployeesModule),
    forwardRef(() => SyncHistoryModule),
  ],
  controllers: [DevicesController],
  providers: [
    DevicesService,
    DevicesGateway,
    NetworkScannerService,
    DeviceMonitorService,
    FingerprintDeviceService,
    TcpSocketService,
  ],
  exports: [DevicesService, FingerprintDeviceService, DevicesGateway],
})
export class DevicesModule {}
