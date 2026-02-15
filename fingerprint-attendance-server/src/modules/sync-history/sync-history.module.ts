import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { SyncHistoryService } from './sync-history.service';
import { SyncHistoryController } from './sync-history.controller';
import { SyncEngineService } from './services/sync-engine.service';
import { SyncQueueService } from './services/sync-queue.service';
import { SyncSchedulerService } from './services/sync-scheduler.service';

import { SyncHistory } from '../../database/entities/sync-history.entity';
import { Device } from '../../database/entities/device.entity';
import { Employee } from '../../database/entities/employee.entity';

import { DevicesModule } from '../devices/devices.module';
import { EmployeesModule } from '../employees/employees.module';
import { AttendanceLogsModule } from '../attendance-logs/attendance-logs.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([SyncHistory, Device, Employee]),
    ConfigModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    forwardRef(() => DevicesModule),
    forwardRef(() => EmployeesModule),
    AttendanceLogsModule,
  ],
  controllers: [SyncHistoryController],
  providers: [
    SyncHistoryService,
    SyncEngineService,
    SyncQueueService,
    SyncSchedulerService,
  ],
  exports: [SyncHistoryService, SyncEngineService, SyncQueueService],
})
export class SyncHistoryModule {}
