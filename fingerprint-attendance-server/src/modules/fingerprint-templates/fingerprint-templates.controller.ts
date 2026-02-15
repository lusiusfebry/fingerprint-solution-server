import { Controller } from '@nestjs/common';
import { FingerprintTemplatesService } from './fingerprint-templates.service';

@Controller('fingerprint-templates')
export class FingerprintTemplatesController {
  constructor(
    private readonly fingerprintTemplatesService: FingerprintTemplatesService,
  ) {}
}
