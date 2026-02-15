import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class DeviceResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  serial_number: string;

  @Expose()
  ip_address: string;

  @Expose()
  port: number;

  @Expose()
  location: string;

  @Expose()
  status: string;

  @Expose()
  last_sync_time: Date;

  @Expose()
  isOnline: boolean;

  constructor(partial: Partial<DeviceResponseDto>) {
    Object.assign(this, partial);
  }
}
