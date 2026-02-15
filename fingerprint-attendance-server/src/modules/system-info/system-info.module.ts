import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemInfoController } from './system-info.controller';
import { SystemInfoService } from './system-info.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [SystemInfoController],
  providers: [SystemInfoService],
})
export class SystemInfoModule {}
