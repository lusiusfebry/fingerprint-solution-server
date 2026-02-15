import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FingerprintTemplate } from '../../database/entities/fingerprint-template.entity';

@Injectable()
export class FingerprintTemplatesService {
  constructor(
    @InjectRepository(FingerprintTemplate)
    private readonly templateRepository: Repository<FingerprintTemplate>,
  ) {}

  async create(
    employeeId: string,
    fingerIndex: number,
    templateData: string,
  ): Promise<FingerprintTemplate> {
    // Check duplicate: same employee + same finger index
    // Manual check removed, relying on DB unique constraint
    /*
        const existing = await this.templateRepository.findOne({
            where: { employee_id: employeeId, finger_index: fingerIndex }
        });

        if (existing) {
            throw new BadRequestException(`Template untuk jari index ${fingerIndex} sudah ada`);
        }
        */

    // Validate template data (basic check)
    if (!templateData || templateData.length < 10) {
      throw new BadRequestException('Template data tidak valid');
    }

    const template = this.templateRepository.create({
      employee_id: employeeId,
      finger_index: fingerIndex,
      template_data: templateData,
      version: 1,
    });

    try {
      return await this.templateRepository.save(template);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === '23505') {
        // Unique violation
        throw new BadRequestException(
          `Template untuk jari index ${fingerIndex} sudah ada`,
        );
      }
      throw error;
    }
  }

  async findByEmployee(employeeId: string): Promise<FingerprintTemplate[]> {
    return this.templateRepository.find({
      where: { employee_id: employeeId },
      order: { finger_index: 'ASC' },
    });
  }

  async findOne(id: string): Promise<FingerprintTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException('Template tidak ditemukan');
    }
    return template;
  }

  async delete(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.templateRepository.remove(template);
  }

  async deleteByEmployee(employeeId: string): Promise<void> {
    await this.templateRepository.delete({ employee_id: employeeId });
  }

  async checkDuplicate(
    employeeId: string,
    fingerIndex: number,
  ): Promise<boolean> {
    const count = await this.templateRepository.count({
      where: { employee_id: employeeId, finger_index: fingerIndex },
    });
    return count > 0;
  }
}
