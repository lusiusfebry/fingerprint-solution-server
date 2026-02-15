import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftsService } from './shifts.service';
import { ShiftsController } from './shifts.controller';
import { Shift } from '../../database/entities/shift.entity';
import { EmployeeShift } from '../../database/entities/employee-shift.entity';
import { Employee } from '../../database/entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shift, EmployeeShift, Employee])],
  controllers: [ShiftsController],
  providers: [ShiftsService],
  exports: [ShiftsService],
})
export class ShiftsModule {}
