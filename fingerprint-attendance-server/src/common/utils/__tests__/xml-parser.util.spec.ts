import { XmlParser } from '../xml-parser.util';

describe('XmlParser', () => {
  describe('parseAttendanceLogs', () => {
    it('should parse valid attendance logs', () => {
      const xml = `
        <GetAttLogResponse>
          <Row>
            <PIN>123</PIN>
            <DateTime>2023-01-01 08:00:00</DateTime>
            <Verified>1</Verified>
            <Status>0</Status>
          </Row>
          <Row>
            <PIN>124</PIN>
            <DateTime>2023-01-01 08:05:00</DateTime>
            <Verified>1</Verified>
            <Status>0</Status>
          </Row>
        </GetAttLogResponse>
      `;
      const result = XmlParser.parseAttendanceLogs(xml);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        pin: '123',
        dateTime: '2023-01-01 08:00:00',
        verified: '1',
        status: '0',
      });
    });

    it('should return empty array for empty response', () => {
      const xml = '<GetAttLogResponse></GetAttLogResponse>';
      const result = XmlParser.parseAttendanceLogs(xml);
      expect(result).toHaveLength(0);
    });
  });

  describe('parseInformation', () => {
    it('should parse information tag', () => {
      const xml =
        '<Response><Information>Operation Succeed</Information></Response>';
      const result = XmlParser.parseInformation(xml);
      expect(result).toBe('Operation Succeed');
    });

    it('should return empty string if tag not found', () => {
      const xml = '<Response><Error>Failed</Error></Response>';
      const result = XmlParser.parseInformation(xml);
      expect(result).toBe('');
    });
  });

  describe('parseDeviceInfo', () => {
    it('should parse device info', () => {
      const xml = `
            <GetDeviceInfoResponse>
                <SerialNumber>SN123456</SerialNumber>
                <DeviceName>X105D</DeviceName>
                <FirmwareVersion>1.0.0</FirmwareVersion>
                <UserCount>100</UserCount>
            </GetDeviceInfoResponse>
          `;
      const result = XmlParser.parseDeviceInfo(xml);
      expect(result.serialNumber).toBe('SN123456');
      expect(result.deviceName).toBe('X105D');
      expect(result.userCount).toBe(100);
    });
  });
});
