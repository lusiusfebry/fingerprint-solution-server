import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from '../../database/entities/system-setting.entity';
import { UpdateSystemSettingsDto } from './dto/update-system-settings.dto';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private settingsRepository: Repository<SystemSetting>,
  ) {}

  // Default settings to fall back on
  private readonly defaultSettings = {
    app_name: 'Fingerprint Attendance System',
    sync_interval: 15,
    conflict_resolution_mode: 'server',
    max_retry_attempts: 3,
    notification_email: '',
    maintenance_mode: false,
    auto_backup_enabled: true,
    backup_schedule: '0 0 * * *', // Daily at midnight
    email_notifications_enabled: true,
    sms_notifications_enabled: false,
    notification_recipients: [],
  };

  /**
   * Retrieve all settings as a unified object
   */
  async getSettings() {
    const storedSettings = await this.settingsRepository.find();

    // Convert array of key-value pairs to object
    const settingsObject = { ...this.defaultSettings };

    storedSettings.forEach((setting) => {
      try {
        // Parse value based on stored type or guess
        if (setting.type === 'number') {
          settingsObject[setting.key] = Number(setting.value);
        } else if (setting.type === 'boolean') {
          settingsObject[setting.key] = setting.value === 'true';
        } else if (setting.type === 'json') {
          settingsObject[setting.key] = JSON.parse(setting.value) as unknown;
        } else {
          settingsObject[setting.key] = setting.value;
        }
      } catch (_e) {
        console.error(`Error parsing setting ${setting.key}:`, _e);
      }
    });

    return settingsObject;
  }

  /**
   * Update settings individually
   */
  async updateSettings(updateDto: UpdateSystemSettingsDto, userId: string) {
    const updates: Promise<SystemSetting>[] = [];

    for (const [key, value] of Object.entries(updateDto)) {
      if (value === undefined) continue;

      let stringValue = String(value);
      let type = 'string';

      if (typeof value === 'number') {
        type = 'number';
      } else if (typeof value === 'boolean') {
        type = 'boolean';
      } else if (typeof value === 'object') {
        stringValue = JSON.stringify(value);
        type = 'json';
      }

      // Check if setting exists
      let setting = await this.settingsRepository.findOne({ where: { key } });

      if (setting) {
        setting.value = stringValue;
        setting.type = type;
        setting.updated_by = userId;
      } else {
        setting = this.settingsRepository.create({
          key,
          value: stringValue,
          type,
          updated_by: userId,
        });
      }

      updates.push(this.settingsRepository.save(setting));
    }

    await Promise.all(updates);
    return this.getSettings();
  }
}
