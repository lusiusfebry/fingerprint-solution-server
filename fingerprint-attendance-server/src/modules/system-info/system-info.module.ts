import { Module } from '@nestjs/common';
import { SystemInfoController } from './system-info.controller';
import { SystemInfoService } from './system-info.service';

@Module({
  controllers: [SystemInfoController],
  providers: [SystemInfoService],
})
export class SystemInfoModule {}
