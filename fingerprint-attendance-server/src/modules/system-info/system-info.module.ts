import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemInfoController } from './system-info.controller';
import { HealthController } from './health.controller';
import { SystemInfoService } from './system-info.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [SystemInfoController, HealthController],
  providers: [SystemInfoService],
})
export class SystemInfoModule {}
