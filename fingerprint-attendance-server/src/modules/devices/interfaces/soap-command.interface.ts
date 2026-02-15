export type SoapCommandType =
  | 'GetAttLog'
  | 'SetUserInfo'
  | 'SetUserTemplate'
  | 'GetUserTemplate'
  | 'DeleteUser'
  | 'DeleteTemplate'
  | 'SetDate'
  | 'Restart'
  | 'ClearData'
  | 'RefreshDB'
  | 'GetDeviceInfo';

export interface ISoapCommand {
  command: string;
  args: Record<string, any>;
}
