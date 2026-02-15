import {
  IAttendanceLog,
  IFingerprintTemplate,
  IDeviceInfo,
} from '../../modules/devices/interfaces/device-response.interface';

export class XmlParser {
  static parseData(
    xmlString: string,
    startTag: string,
    endTag: string,
  ): string {
    const regex = new RegExp(`${startTag}(.*?)${endTag}`, 's');
    const match = xmlString.match(regex);
    return match ? match[1].trim() : '';
  }

  static parseAttendanceLogs(xmlResponse: string): IAttendanceLog[] {
    const logs: IAttendanceLog[] = [];
    const rowRegex = /<Row>(.*?)<\/Row>/gs;
    let match: RegExpExecArray | null;

    while ((match = rowRegex.exec(xmlResponse)) !== null) {
      const rowContent = match[1];
      const pin = this.parseData(rowContent, '<PIN>', '</PIN>');
      const dateTime = this.parseData(rowContent, '<DateTime>', '</DateTime>');
      const verified = this.parseData(rowContent, '<Verified>', '</Verified>');
      const status = this.parseData(rowContent, '<Status>', '</Status>');

      if (pin && dateTime) {
        logs.push({ pin, dateTime, verified, status });
      }
    }
    return logs;
  }

  static parseFingerprintTemplates(
    xmlResponse: string,
  ): IFingerprintTemplate[] {
    const templates: IFingerprintTemplate[] = [];
    const rowRegex = /<Row>(.*?)<\/Row>/gs;
    let match: RegExpExecArray | null;

    while ((match = rowRegex.exec(xmlResponse)) !== null) {
      const rowContent = match[1];
      const pin = this.parseData(rowContent, '<PIN>', '</PIN>');
      const fingerId = this.parseData(rowContent, '<FingerID>', '</FingerID>');
      const size = parseInt(
        this.parseData(rowContent, '<Size>', '</Size>') || '0',
        10,
      );
      const valid = parseInt(
        this.parseData(rowContent, '<Valid>', '</Valid>') || '1',
        10,
      );
      const template = this.parseData(rowContent, '<Template>', '</Template>');

      if (pin && fingerId && template) {
        templates.push({ pin, fingerId, size, valid, template });
      }
    }
    return templates;
  }

  static parseInformation(xmlResponse: string): string {
    return this.parseData(xmlResponse, '<Information>', '</Information>');
  }

  static parseDeviceInfo(xmlResponse: string): Partial<IDeviceInfo> {
    const info: Partial<IDeviceInfo> = {};
    // const content = this.parseData(xmlResponse, '<Content>', '</Content>'); // Unused variable

    // Based on typical SDK responses, sometimes fields are direct children of a response tag
    info.serialNumber = this.parseData(
      xmlResponse,
      '<SerialNumber>',
      '</SerialNumber>',
    );
    info.deviceName = this.parseData(
      xmlResponse,
      '<DeviceName>',
      '</DeviceName>',
    );
    info.firmwareVersion = this.parseData(
      xmlResponse,
      '<FirmwareVersion>',
      '</FirmwareVersion>',
    );
    info.userCount = parseInt(
      this.parseData(xmlResponse, '<UserCount>', '</UserCount>') || '0',
      10,
    );
    info.fpCount = parseInt(
      this.parseData(xmlResponse, '<FPCount>', '</FPCount>') || '0',
      10,
    );
    info.logCount = parseInt(
      this.parseData(xmlResponse, '<LogCount>', '</LogCount>') || '0',
      10,
    );

    return info;
  }
  static parseUsers(xmlResponse: string): any[] {
    const users: any[] = [];
    const rowRegex = /<Row>(.*?)<\/Row>/gs;
    let match: RegExpExecArray | null;

    while ((match = rowRegex.exec(xmlResponse)) !== null) {
      const rowContent = match[1];
      const pin = this.parseData(rowContent, '<PIN>', '</PIN>');
      const name = this.parseData(rowContent, '<Name>', '</Name>');
      const password = this.parseData(rowContent, '<Password>', '</Password>');
      const group = this.parseData(rowContent, '<Group>', '</Group>');
      const privilege = this.parseData(
        rowContent,
        '<Privilege>',
        '</Privilege>',
      );
      const card = this.parseData(rowContent, '<Card>', '</Card>');

      if (pin) {
        users.push({ pin, name, password, group, privilege, card });
      }
    }
    return users;
  }
}
