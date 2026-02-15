import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FingerprintTemplate } from '../../database/entities/fingerprint-template.entity';
import { FingerprintTemplatesService } from './fingerprint-templates.service';
import { FingerprintTemplatesController } from './fingerprint-templates.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FingerprintTemplate])],
  controllers: [FingerprintTemplatesController],
  providers: [FingerprintTemplatesService],
  exports: [FingerprintTemplatesService],
})
export class FingerprintTemplatesModule {}
