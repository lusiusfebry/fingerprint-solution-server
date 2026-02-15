import { SoapBuilder } from '../soap-builder.util';

describe('SoapBuilder', () => {
  it('should build GetAttLog command with default "All"', () => {
    const xml = SoapBuilder.buildGetAttLog('0', 'All');
    expect(xml).toContain('<GetAttLog xmlns="http://tempuri.org/">');
    expect(xml).toContain('<ArgComKey xsi:type="xsd:integer">0</ArgComKey>');
    expect(xml).toContain('<ArgPIN xsi:type="xsd:string">All</ArgPIN>');
  });

  it('should build GetAttLog command with specific PIN', () => {
    const xml = SoapBuilder.buildGetAttLog('0', '123');
    expect(xml).toContain('<ArgPIN xsi:type="xsd:integer">123</ArgPIN>');
  });

  it('should build SetUserInfo command', () => {
    const xml = SoapBuilder.buildSetUserInfo('0', '123', 'John Doe');
    expect(xml).toContain('<SetUserInfo xmlns="http://tempuri.org/">');
    expect(xml).toContain('<ArgPIN xsi:type="xsd:integer">123</ArgPIN>');
    expect(xml).toContain('<ArgName xsi:type="xsd:string">John Doe</ArgName>');
  });

  it('should build Restart command', () => {
    const xml = SoapBuilder.buildRestart('0');
    expect(xml).toContain('<Restart xmlns="http://tempuri.org/">');
  });

  it('should build GetDeviceInfo command', () => {
    const xml = SoapBuilder.buildGetDeviceInfo('0');
    expect(xml).toContain('<GetDeviceInfo xmlns="http://tempuri.org/">');
    expect(xml).toContain('<Arg>DeviceName</Arg>');
  });
});
