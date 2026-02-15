export interface IDeviceResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface IAttendanceLog {
  pin: string;
  dateTime: string;
  verified: string;
  status: string;
}

export interface IFingerprintTemplate {
  pin: string;
  fingerId: string;
  size: number;
  valid: number;
  template: string;
}

export interface IDeviceInfo {
  serialNumber: string;
  deviceName: string;
  firmwareVersion: string;
  userCount: number;
  fpCount: number;
  logCount: number;
}
