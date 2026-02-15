export class SoapBuilder {
  private static buildEnvelope(body: string): string {
    return `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
      <soapenv:Header/>
      <soapenv:Body>${body}</soapenv:Body>
    </soapenv:Envelope>`;
  }

  static buildGetAttLog(commKey: string, pin: string = 'All'): string {
    const pinType = pin === 'All' ? 'xsd:string' : 'xsd:integer';
    const body = `<GetAttLog xmlns="http://tempuri.org/">
      <ArgComKey xsi:type="xsd:integer">${commKey}</ArgComKey>
      <ArgPIN xsi:type="${pinType}">${pin}</ArgPIN>
    </GetAttLog>`;
    return this.buildEnvelope(body);
  }

  static buildSetUserInfo(commKey: string, pin: string, name: string): string {
    const body = `<SetUserInfo xmlns="http://tempuri.org/">
      <ArgComKey xsi:type="xsd:integer">${commKey}</ArgComKey>
      <ArgPIN xsi:type="xsd:integer">${pin}</ArgPIN>
      <ArgName xsi:type="xsd:string">${name}</ArgName>
    </SetUserInfo>`;
    return this.buildEnvelope(body);
  }

  static buildSetUserTemplate(
    commKey: string,
    pin: string,
    fingerId: number,
    template: string,
  ): string {
    const body = `<SetUserTemplate xmlns="http://tempuri.org/">
      <ArgComKey xsi:type="xsd:integer">${commKey}</ArgComKey>
      <ArgPIN xsi:type="xsd:integer">${pin}</ArgPIN>
      <ArgFingerID xsi:type="xsd:integer">${fingerId}</ArgFingerID>
      <ArgSize xsi:type="xsd:integer">${template.length}</ArgSize>
      <ArgValid xsi:type="xsd:integer">1</ArgValid>
      <ArgTemplate xsi:type="xsd:string">${template}</ArgTemplate>
    </SetUserTemplate>`;
    return this.buildEnvelope(body);
  }

  static buildGetUserTemplate(
    commKey: string,
    pin: string,
    fingerId: number,
  ): string {
    const body = `<GetUserTemplate xmlns="http://tempuri.org/">
      <ArgComKey xsi:type="xsd:integer">${commKey}</ArgComKey>
      <ArgPIN xsi:type="xsd:integer">${pin}</ArgPIN>
      <ArgFingerID xsi:type="xsd:integer">${fingerId}</ArgFingerID>
    </GetUserTemplate>`;
    return this.buildEnvelope(body);
  }

  static buildDeleteUser(commKey: string, pin: string): string {
    const body = `<DeleteUser xmlns="http://tempuri.org/">
      <ArgComKey xsi:type="xsd:integer">${commKey}</ArgComKey>
      <ArgPIN xsi:type="xsd:integer">${pin}</ArgPIN>
    </DeleteUser>`;
    return this.buildEnvelope(body);
  }

  static buildDeleteTemplate(commKey: string, pin: string): string {
    const body = `<DeleteTemplate xmlns="http://tempuri.org/">
      <ArgComKey xsi:type="xsd:integer">${commKey}</ArgComKey>
      <ArgPIN xsi:type="xsd:integer">${pin}</ArgPIN>
    </DeleteTemplate>`;
    return this.buildEnvelope(body);
  }

  static buildSetDate(commKey: string, date: string, time: string): string {
    const body = `<SetDate xmlns="http://tempuri.org/">
      <ArgComKey xsi:type="xsd:integer">${commKey}</ArgComKey>
      <ArgDate xsi:type="xsd:string">${date}</ArgDate>
      <ArgTime xsi:type="xsd:string">${time}</ArgTime>
    </SetDate>`;
    return this.buildEnvelope(body);
  }

  static buildRestart(commKey: string): string {
    const body = `<Restart xmlns="http://tempuri.org/">
      <ArgComKey xsi:type="xsd:integer">${commKey}</ArgComKey>
    </Restart>`;
    return this.buildEnvelope(body);
  }

  static buildClearData(commKey: string, value: number = 3): string {
    const body = `<ClearData xmlns="http://tempuri.org/">
      <ArgComKey xsi:type="xsd:integer">${commKey}</ArgComKey>
      <ArgValue xsi:type="xsd:integer">${value}</ArgValue>
    </ClearData>`;
    return this.buildEnvelope(body);
  }

  static buildRefreshDB(commKey: string): string {
    const body = `<RefreshDB xmlns="http://tempuri.org/">
      <ArgComKey xsi:type="xsd:integer">${commKey}</ArgComKey>
    </RefreshDB>`;
    return this.buildEnvelope(body);
  }

  static buildGetDeviceInfo(
    commKey: string,
    arg: string = 'DeviceName',
  ): string {
    const body = `<GetDeviceInfo xmlns="http://tempuri.org/">
      <ArgComKey xsi:type="xsd:integer">${commKey}</ArgComKey>
      <Arg>${arg}</Arg>
    </GetDeviceInfo>`;
    return this.buildEnvelope(body);
  }
  static buildGetUserInfo(commKey: string, pin: string = 'All'): string {
    const pinType = pin === 'All' ? 'xsd:string' : 'xsd:integer';
    const body = `<GetUserInfo xmlns="http://tempuri.org/">
      <ArgComKey xsi:type="xsd:integer">${commKey}</ArgComKey>
      <ArgPIN xsi:type="${pinType}">${pin}</ArgPIN>
    </GetUserInfo>`;
    return this.buildEnvelope(body);
  }

  static buildGetAllUserTemplate(commKey: string): string {
    const body = `<GetUserTemplate xmlns="http://tempuri.org/">
      <ArgComKey xsi:type="xsd:integer">${commKey}</ArgComKey>
      <ArgPIN xsi:type="xsd:string">All</ArgPIN>
      <ArgFingerID xsi:type="xsd:integer">All</ArgFingerID>
    </GetUserTemplate>`;
    return this.buildEnvelope(body);
  }
}
