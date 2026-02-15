import { Module } from '@nestjs/common';
import { AttendanceLogsService } from './attendance-logs.service';
import { AttendanceLogsController } from './attendance-logs.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceLog } from '../../database/entities/attendance-log.entity';
import { Employee } from '../../database/entities/employee.entity';
import { Device } from '../../database/entities/device.entity';
import { DevicesModule } from '../devices/devices.module';
import { ShiftsModule } from '../shifts/shifts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AttendanceLog, Employee, Device]),
    DevicesModule,
    ShiftsModule,
  ],
  controllers: [AttendanceLogsController],
  providers: [AttendanceLogsService],
  exports: [AttendanceLogsService],
})
export class AttendanceLogsModule {}
