import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { Employee } from '../../database/entities/employee.entity';
import { Device } from '../../database/entities/device.entity';
import { FingerprintTemplatesModule } from '../fingerprint-templates/fingerprint-templates.module';
import { DevicesModule } from '../devices/devices.module';
import { ShiftsModule } from '../shifts/shifts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, Device]),
    FingerprintTemplatesModule,
    forwardRef(() => DevicesModule),
    forwardRef(() => ShiftsModule),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
