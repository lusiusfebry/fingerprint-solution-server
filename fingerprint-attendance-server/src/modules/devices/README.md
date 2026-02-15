# Device Communication Layer

This module handles communication with X105D fingerprint devices using SOAP over TCP (Port 80).

## Architecture

- **`FingerprintDeviceService`**: High-level service for devices operations.
- **`TcpSocketService`**: Low-level TCP socket handler.
- **`SoapBuilder`**: Helper to construct SOAP XML requests.
- **`XmlParser`**: Helper to parse XML responses.
- **`@Retry`**: Decorator for handling transient network errors.

## Supported Operations

- **Connection**: `connect`, `testConnection`
- **Info**: `getDeviceInfo`
- **Attendance**: `downloadAttendanceLogs`, `clearAttendanceLogs`
- **Employees**: `uploadEmployee`, `deleteEmployee`
- **Templates**: `uploadFingerprintTemplate`, `downloadFingerprintTemplate`, `deleteFingerprintTemplate`
- **Utils**: `syncTime`, `clearData`, `restartDevice`

## Usage Example

```typescript
import { FingerprintDeviceService } from './services/fingerprint-device.service';

@Injectable()
export class YourService {
  constructor(private deviceService: FingerprintDeviceService) {}

  async syncLogs() {
    const config = {
      ipAddress: '192.168.1.201',
      port: 80,
      commKey: '0'
    };

    const response = await this.deviceService.downloadAttendanceLogs(config);
    if (response.success) {
      console.log('Logs:', response.data);
    }
  }
}
```

## Error Handling

All methods return `IDeviceResponse` object:
```typescript
interface IDeviceResponse {
  success: boolean;
  message: string;
  data?: any;
}
```

Exceptions like `DeviceConnectionError` are caught internally by the service and returned as `{ success: false, message: ... }`.

## Configuration

Set the following in `.env` (optional, used if implemented in config service):
```
DEVICE_DEFAULT_PORT=80
DEVICE_CONNECTION_TIMEOUT=5000
DEVICE_OPERATION_TIMEOUT=30000
```
