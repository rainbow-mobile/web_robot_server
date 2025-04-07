import httpLogger from '@common/logger/http.logger';
import { errorToJson } from '@common/util/error.util';
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as dgram from 'dgram';
import { v4 as uuidv4 } from 'uuid';
import * as os from 'os';
import * as xml2js from 'xml2js';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { VariablesService } from '../variables/variables.service';
import { execSync } from 'child_process';

const MULTICAST_ADDRESS = '239.255.255.250';
const PORT = 3702;

@Injectable()
export class OnvifDeviceService implements OnModuleInit {
  constructor(
    private readonly socketGateway: SocketGateway,
    private readonly variableService: VariablesService,
  ) {}

  private server: any;
  private service: any;

  async onModuleInit() {
    this.server = dgram.createSocket('udp4');
    this.getVariables();
    this.server.on('message', (msg, rinfo) => {
      try {
        const parser = new xml2js.Parser({
          explicitArray: false,
          tagNameProcessors: [xml2js.processors.stripPrefix],
        });
        parser.parseString(msg, (err, result) => {
          if (err) {
            console.log('Error parsing XML:', err);
            return;
          }

          if (
            result['Envelope'] &&
            result['Envelope']['Body'] &&
            result['Envelope']['Header'] &&
            result['Envelope']['Header']['MessageID']
          ) {
            if (
              result['Envelope']['Body']['Probe'] &&
              JSON.stringify(
                result['Envelope']['Body']['Probe']['Types'],
              ).includes('Device')
            ) {
              console.log(rinfo);
              console.log(`ONVIF Read : ${JSON.stringify(result)}`);
              this.responseProbe(result, rinfo);
            }
          }
        });
      } catch (error) {
        console.error(error);
      }
    });

    // Multicast 그룹에 가입하여 요청을 대기
    this.server.bind(PORT, () => {
      this.server.setMulticastLoopback(false);
      this.server.addMembership(MULTICAST_ADDRESS);
      console.log(`ONVIF server listening on ${MULTICAST_ADDRESS}:${PORT}`);
      this.hello();
    });
  }

  async getVariables() {
    global.robotSerial = await this.variableService.getVariable('robotSerial');
    global.robotManufacturer =
      await this.variableService.getVariable('robotManufacturer');
    global.robotModel = await this.variableService.getVariable('robotModel');
    global.robotVersion =
      await this.variableService.getVariable('robotVersion');
    global.robotHardware =
      await this.variableService.getVariable('robotHardware');

    if (!global.robotManufacturer) {
      await this.variableService.upsertVariable(
        'robotManufacturer',
        'RainbowRobotics',
      );
      global.robotManufacturer =
        await this.variableService.getVariable('robotManufacturer');
    }

    if (!global.robotModel) {
      await this.variableService.upsertVariable('robotModel', 'D400');
      global.robotModel = await this.variableService.getVariable('robotModel');
    }

    if (!global.robotVersion) {
      await this.variableService.upsertVariable('robotVersion', '1.0.0');
      global.robotVersion =
        await this.variableService.getVariable('robotVersion');
    }

    if (!global.robotHardware) {
      await this.variableService.upsertVariable('robotHardware', 'D400_TEST');
      global.robotHardware =
        await this.variableService.getVariable('robotHardware');
    }
  }

  //wsdl파일 경로 반환
  getWSDLPath(category: string, filename: string) {
    return (
      process.cwd() +
      '/wsdl/' +
      category +
      '/' +
      filename
    );
  }

  // 랜덤 UUID 생성 (UUID v4)
  generateUUID() {
    return uuidv4();
  }

  getXaddrs(url: string) {
    let xaddrs: string = '';
    this.getLocalIps().map((ip) => {
      xaddrs += this.getXaddr(ip, url) + ' ';
    });
    console.log(this.getLocalIps(), xaddrs);
    return xaddrs;
  }

  getXaddr(ip: string, url: string) {
    if (ip.includes('::ffff:')) {
      ip = ip.split('::ffff:')[1];
    }
    return 'http://' + ip + ':11334/api/onvif/' + url;
  }

  getStream(ip: string, url: string) {
    if (ip.includes('::ffff:')) {
      ip = ip.split('::ffff:')[1];
    }
    return 'rtsp://' + ip + ':8554/' + url;
  }
  // 네트워크 인터페이스에 따라 적절한 IP를 반환하는 함수
  getLocalIp(clientIp: string): any {
    if (clientIp.includes('::ffff:')) {
      clientIp = clientIp.split('::ffff:')[1];
    }
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
      for (const config of iface || []) {
        if (config.family === 'IPv4' && !config.internal) {
          // 같은 네트워크 대역대에 있는 IP만 반환
          httpLogger.info(
            `[ONVIF] getLocalIP : ${clientIp}, ${JSON.stringify(config)}`,
          );
          if (
            clientIp.startsWith(
              config.address.substring(0, config.address.lastIndexOf('.')),
            )
          ) {
            return config;
          }
        }
      }
    }
    return '127.0.0.1';
  }

  getLocalIps(): string[] {
    const interfaces = os.networkInterfaces();
    const ips: string[] = [];
    for (const iface of Object.values(interfaces)) {
      for (const config of iface || []) {
        if (config.family === 'IPv4' && !config.internal) {
          // 같은 네트워크 대역대에 있는 IP만 반환
          httpLogger.info(`[ONVIF] getLocalIps :  ${config.address}`);
          ips.push(config.address);
        }
      }
    }
    return ips;
  }

  /***************** Hello ******************/
  async hello() {
    let helloMsg = fs
      .readFileSync(this.getWSDLPath('device', 'hello.wsdl'))
      .toString();

    helloMsg = helloMsg.replace('__MESSAGE_ID__', this.generateUUID());
    helloMsg = helloMsg.replace('__ADDRESS__', global.robotSerial);
    helloMsg = helloMsg.replace('__XADDRS__', this.getXaddrs('device_service'));

    httpLogger.debug(`[ONVIF] hello: ${helloMsg}`);

    await this.server.send(
      helloMsg,
      0,
      helloMsg.length,
      PORT,
      MULTICAST_ADDRESS,
      (err) => {
        if (err) console.error('Error Sending Hello : ', err);
      },
    );
  }

  /***************** Device ******************/
  async responseProbe(message, rinfo) {
    let probeMatchMsg = fs
      .readFileSync(this.getWSDLPath('device', 'probematches.wsdl'))
      .toString();

    probeMatchMsg = probeMatchMsg.replace(
      '__MESSAGE_ID__',
      this.generateUUID(),
    );
    probeMatchMsg = probeMatchMsg.replace(
      '__RELATES_TO__',
      message['Envelope']['Header']['MessageID'],
    );
    probeMatchMsg = probeMatchMsg.replace('__INSTANCE_ID__', '6666336');
    probeMatchMsg = probeMatchMsg.replace('__MESSAGE_NUMBER__', '1');
    probeMatchMsg = probeMatchMsg.replace('__ADDRESS__', global.robotSerial);
    probeMatchMsg = probeMatchMsg.replace(
      '__DEVICE_XADDRS__',
      this.getXaddrs('device_service'),
    );

    const messageBuffer = Buffer.from(probeMatchMsg, 'utf-8');
    httpLogger.info(`[ONVIF] responseProbe: ${probeMatchMsg}`);

    this.server.send(
      messageBuffer,
      0,
      messageBuffer.length,
      rinfo.port,
      rinfo.address,
      (err) => {
        if (err) console.log('Error sending response:', err);
      },
    );
  }

  async responseSystemDateAndTime() {
    return new Promise(async (resolve, reject) => {
      try {
        let query = fs
          .readFileSync(this.getWSDLPath('device', 'dateandtime.wsdl'))
          .toString();

        const nowTime = new Date();
        query = query.replace(
          '__YEAR_UTC__',
          nowTime.getUTCFullYear().toString(),
        );
        query = query.replace(
          '__MONTH_UTC__',
          (nowTime.getUTCMonth() + 1).toString(),
        );
        query = query.replace('__DAY_UTC__', nowTime.getUTCDate().toString());
        query = query.replace('__HOUR_UTC__', nowTime.getUTCHours().toString());
        query = query.replace(
          '__MINUTE_UTC__',
          nowTime.getUTCMinutes().toString(),
        );
        query = query.replace(
          '__SECOND_UTC__',
          nowTime.getUTCSeconds().toString(),
        );
        query = query.replace('__YEAR__', nowTime.getFullYear().toString());
        query = query.replace('__MONTH__', (nowTime.getMonth() + 1).toString());
        query = query.replace('__DAY__', nowTime.getDate().toString());
        query = query.replace('__HOUR__', nowTime.getHours().toString());
        query = query.replace('__MINUTE__', nowTime.getMinutes().toString());
        query = query.replace('__SECOND__', nowTime.getSeconds().toString());

        httpLogger.debug(`[ONVIF] responseSystemDateAndTime: ${query}`);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(
          `[ONVIF] responseSystemDateAndTime : ${errorToJson(error)}`,
        );
        reject();
      }
    });
  }

  async setSystemDateAndTime() {}

  async responseCapabilities(_ip: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const ip = this.getLocalIp(_ip).address;
        let query = fs
          .readFileSync(this.getWSDLPath('device', 'capabilities.wsdl'))
          .toString();
        query = query.replace(
          '__DEVICE_SERVICE__',
          this.getXaddr(ip, 'device_service'),
        );
        query = query.replace(
          '__MEDIA_SERVICE__',
          this.getXaddr(ip, 'media_service'),
        );
        query = query.replace(
          '__EVENTS_SERVICE__',
          this.getXaddr(ip, 'events_service'),
        );
        query = query.replace(
          '__PTZ_SERVICE__',
          this.getXaddr(ip, 'ptz_service'),
        );
        query = query.replace(
          '__DEVICE_IO_SERVICE__',
          this.getXaddr(ip, 'deviceio_service'),
        );
        httpLogger.info(`[ONVIF] responseCapabilities: ${query}`);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(
          `[ONVIF] responseCapabilities : ${errorToJson(error)}`,
        );
        reject();
      }
    });
  }

  async responseDeviceInformation() {
    return new Promise(async (resolve, reject) => {
      try {
        let query = fs
          .readFileSync(this.getWSDLPath('device', 'deviceinformation.wsdl'))
          .toString();
        query = query.replace('__MANUFACTURER__', global.robotManufacturer);
        query = query.replace('__MODEL__', global.robotModel);
        query = query.replace('__FIRMWARE__VERSION__', global.robotVersion);
        query = query.replace('__SERIAL_NUMBER__', global.robotSerial);
        query = query.replace('__HARDWARE_ID__', global.robotHardware);

        httpLogger.debug(`[ONVIF] responseDeviceInformation: ${query}`);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(
          `[ONVIF] responseDeviceInformation : ${errorToJson(error)}`,
        );
        reject();
      }
    });
  }

  getScopeQuery(scope: string) {
    return `<tds:Scopes>
      <tt:ScopeItem>${scope}</tt:ScopeItem>
    </tds:Scopes>`;
  }
  async responseScopes() {
    return new Promise(async (resolve, reject) => {
      try {
        let query = fs
          .readFileSync(this.getWSDLPath('device', 'scopes.wsdl'))
          .toString();

        let scopes_query = '';

        scopes_query += this.getScopeQuery(
          'onvif://onvif://www.onvif.org/Profile/Streaming',
        );
        scopes_query += this.getScopeQuery(
          'onvif://www.onvif.org/location/country/Korea',
        );
        scopes_query += this.getScopeQuery(
          'onvif://www.onvif.org/name/' + global.robotSerial,
        );

        scopes_query += this.getScopeQuery(
          'onvif://www.onvif.org/type/video_encoder',
        );

        scopes_query += this.getScopeQuery('onvif://www.onvif.org/type/ptz');

        scopes_query += this.getScopeQuery(
          'onvif://www.onvif.org/type/Network_Video_Transmitter',
        );

        query = query.replace('__SCOPES__', scopes_query);
        httpLogger.debug(`[ONVIF] responseScopes: ${query}`);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(`[ONVIF] responseScopes : ${errorToJson(error)}`);
        reject();
      }
    });
  }

  async responseNetworkInterfaces(_ip: string) {
    return new Promise(async (resolve, reject) => {
      try {
        let query = fs
          .readFileSync(
            this.getWSDLPath('device', 'network/networkinterfaces.wsdl'),
          )
          .toString();

        const connection = this.getConnection(_ip);
        if (connection) {
          query = query.replace('__NAME__', connection.name);
          query = query.replace('__HW_ADDRESS__', connection.mac);
          query = query.replace('__IPV4__', connection.address);
          query = query.replace('__IPV4_DHCP__', connection.address);
          query = query.replace('__IS_DHCP__', connection.dhcp);
          query = query.replace('__IPV4_SUBNET__', connection.subnet);
          query = query.replace('__IPV4_SUBNET__', connection.subnet);
        }

        httpLogger.info(`[ONVIF] responseNetworkInterfaces: ${query}`);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(
          `[ONVIF] responseNetworkInterfaces : ${errorToJson(error)}`,
        );
        reject();
      }
    });
  }

  async responseDNS(_ip: string) {
    return new Promise(async (resolve, reject) => {
      try {
        let query = fs
          .readFileSync(this.getWSDLPath('device', 'network/dns.wsdl'))
          .toString();

        const connection = this.getConnection(_ip);
        if (connection) {
          let dns_query = '';
          for (let i = 0; i < connection.dns.length; i++) {
            dns_query +=
              `<DNS${i + 1}>${connection.dns[i]}</DNS${i + 1}>` + '\n';
          }
          query = query.replace('__DNS__', dns_query);
        }
        httpLogger.debug(`[ONVIF] responseDNS: ${query}`);
        console.log(query);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(`[ONVIF] responseDNS : ${errorToJson(error)}`);
        reject();
      }
    });
  }

  async responseNTP() {
    return new Promise(async (resolve, reject) => {
      try {
        const query = fs
          .readFileSync(this.getWSDLPath('device', 'network/ntp.wsdl'))
          .toString();
        console.log(query);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(`[ONVIF] responseNTP : ${errorToJson(error)}`);
        reject();
      }
    });
  }

  getActiveConnections(): string[] {
    try {
      // 'nmcli' 명령어를 실행하여 활성화된 네트워크 연결 정보를 가져옵니다.
      const buffer = execSync('nmcli connection show --active');
      const result = buffer.toString();
      const connections = [];
      result.split('\n').map((line) => {
        if (!line.startsWith('NAME ') && line != '') {
          connections.push(line.split('  ')[0]);
        }
      });

      return connections;
    } catch (error) {
      // 오류 발생 시 메시지를 반환합니다.
      console.error(`명령어 실행 중 오류 발생: ${error.message}`);
      return [];
    }
  }
  getConnection(_ip: string): any {
    try {
      //IP v4버전으로 변경
      if (_ip.includes('::ffff:')) {
        _ip = _ip.split('::ffff:')[1];
      }

      const connections = this.getActiveConnections();
      for (let i = 0; i < connections.length; i++) {
        const data = execSync(
          `nmcli connection show '${connections[i]}'`,
        ).toString();

        const info = {
          name: connections[i],
          device: '',
          subnet: '',
          gateway: '',
          address: '',
          dhcp: false,
          mac: '',
          dns: [],
        };

        data.split('\n').map((line) => {
          if (line.startsWith('IP4.GATEWAY')) {
            info.gateway = line.split(' ')[line.split(' ').length - 1];
          } else if (line.startsWith('IP4.ADDRESS')) {
            const address = line.split(' ')[line.split(' ').length - 1];

            info.address = address.split('/')[0];
            info.subnet = address.split('/')[1];
          } else if (line.startsWith('ipv4.method')) {
            if (line.includes('auto')) {
              info.dhcp = true;
            } else {
              info.dhcp = false;
            }
          } else if (line.startsWith('IP4.DNS')) {
            info.dns.push(line.split(' ')[line.split(' ').length - 1]);
          } else if (line.startsWith('GENERAL.DEVICE')) {
            info.device = line.split(' ')[line.split(' ').length - 1];
          }
        });

        const interfaces = os.networkInterfaces();
        for (const iface of Object.values(interfaces)) {
          for (const config of iface || []) {
            if (config.address == info.address) {
              info.mac = config.mac;
            }
          }
        }
        if (
          _ip.startsWith(
            info.address.substring(0, info.address.lastIndexOf('.')),
          )
        ) {
          return info;
        }
      }
      return null;
    } catch (error) {
      // 오류 발생 시 메시지를 반환합니다.
      console.error(`명령어 실행 중 오류 발생: ${error.message}`);
      return null;
    }
  }
  async responseDefaultGateway(_ip: string) {
    return new Promise(async (resolve, reject) => {
      try {
        let query = fs
          .readFileSync(
            this.getWSDLPath('device', 'network/defaultgateway.wsdl'),
          )
          .toString();

        const connection = this.getConnection(_ip);
        if (connection) {
          query = query.replace('__GATEWAY__', connection.gateway);
        }
        httpLogger.debug(`[ONVIF] responseDefaultGateway : ${query}`);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(
          `[ONVIF] responseDefaultGateway : ${errorToJson(error)}`,
        );
        reject();
      }
    });
  }

  async responseDiscoveryMode() {
    return new Promise(async (resolve, reject) => {
      try {
        const query = fs
          .readFileSync(this.getWSDLPath('device', 'discoverymode.wsdl'))
          .toString();
        console.log(query);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(
          `[ONVIF] responseDiscoveryMode : ${errorToJson(error)}`,
        );
        reject();
      }
    });
  }

  async responseNetworkProtocols() {
    return new Promise(async (resolve, reject) => {
      try {
        const query = fs
          .readFileSync(
            this.getWSDLPath('device', 'network/networkprotocols.wsdl'),
          )
          .toString();
        console.log(query);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(
          `[ONVIF] responseNetworkProtocols : ${errorToJson(error)}`,
        );
        reject();
      }
    });
  }

  async responseHostname() {
    return new Promise(async (resolve, reject) => {
      try {
        const query = fs
          .readFileSync(this.getWSDLPath('device', 'network/hostname.wsdl'))
          .toString();
        console.log(query);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(`[ONVIF] responseDNS : ${errorToJson(error)}`);
        reject();
      }
    });
  }

  async responseServices(_ip: string) {
    return new Promise(async (resolve, reject) => {
      try {
        let query = fs
          .readFileSync(this.getWSDLPath('device', 'services.wsdl'))
          .toString();
        const ip = this.getLocalIp(_ip).address;
        query = query.replace(
          '__DEVICE_SERVICE__',
          this.getXaddr(ip, 'device_service'),
        );
        query = query.replace(
          '__MEDIA_SERVICE__',
          this.getXaddr(ip, 'media_service'),
        );
        query = query.replace(
          '__PTZ_SERVICE__',
          this.getXaddr(ip, 'ptz_service'),
        );
        console.log(query);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(`[ONVIF] responseServices : ${errorToJson(error)}`);
        reject();
      }
    });
  }

  /***************** Media ******************/
  async responseMediaProfiles() {
    return new Promise(async (resolve, reject) => {
      try {
        const query = fs
          .readFileSync(this.getWSDLPath('media', 'profiles.wsdl'))
          .toString();
        console.log(query);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(
          `[ONVIF] responseMediaProfiles : ${errorToJson(error)}`,
        );
        reject();
      }
    });
  }

  async responseMediaProfile() {
    return new Promise(async (resolve, reject) => {
      try {
        const query = fs
          .readFileSync(this.getWSDLPath('media', 'profile.wsdl'))
          .toString();
        console.log(query);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(
          `[ONVIF] responseMediaProfile : ${errorToJson(error)}`,
        );
        reject();
      }
    });
  }

  async responseVideoSourceConfiguration() {
    return new Promise(async (resolve, reject) => {
      try {
        const query = fs
          .readFileSync(
            this.getWSDLPath('media', 'videosourceconfiguration.wsdl'),
          )
          .toString();
        console.log(query);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(
          `[ONVIF] responseVideoSourceConfiguration : ${errorToJson(error)}`,
        );
        reject();
      }
    });
  }

  async responseVideoSources() {
    return new Promise(async (resolve, reject) => {
      try {
        const query = fs
          .readFileSync(this.getWSDLPath('media', 'videosources.wsdl'))
          .toString();
        console.log(query);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(
          `[ONVIF] responseVideoSources : ${errorToJson(error)}`,
        );
        reject();
      }
    });
  }

  async responseAudioSources() {
    return new Promise(async (resolve, reject) => {
      try {
        const query = fs
          .readFileSync(this.getWSDLPath('media', 'videosources.wsdl'))
          .toString();
        console.log(query);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(
          `[ONVIF] responseAudioSources : ${errorToJson(error)}`,
        );
        reject();
      }
    });
  }

  async responseSnapshotUri(_ip: string) {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.socketGateway.streaming) {
          this.socketGateway.streaming.emit('snapshot');
        }
        const ip = this.getLocalIp(_ip).address;
        let query = fs
          .readFileSync(this.getWSDLPath('media', 'snapshoturi.wsdl'))
          .toString();
        query = query.replace(
          '__SNAPSHOT_URI__',
          this.getXaddr(ip, 'snapshot.jpg'),
        );
        console.log(query);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(`[ONVIF] responseSnapshotUri : ${errorToJson(error)}`);
        reject();
      }
    });
  }

  async responseStreamUri(_ip: string) {
    return new Promise(async (resolve, reject) => {
      try {
        let query = fs
          .readFileSync(this.getWSDLPath('media', 'streamuri.wsdl'))
          .toString();

        const ip = this.getLocalIp(_ip).address;
        query = query.replace('__RTSP_URI__', this.getStream(ip, 'cam0'));
        console.log(query);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(`[ONVIF] responseStreamUri : ${errorToJson(error)}`);
        reject();
      }
    });
  }

  /***************** PTZ ******************/
  async responsePTZMove(title: string) {
    return new Promise(async (resolve, reject) => {
      try {
        let query = fs
          .readFileSync(this.getWSDLPath('ptz', 'move.wsdl'))
          .toString();
        query = query.replace('__RESPONSE_TITLE__', title);
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(
          `[ONVIF] responsePTZContinousMove : ${errorToJson(error)}`,
        );
        reject();
      }
    });
  }
  async responseSetPreset() {
    return new Promise(async (resolve, reject) => {
      try {
        const query = fs
          .readFileSync(this.getWSDLPath('ptz', 'setpreset.wsdl'))
          .toString();
        resolve(Buffer.from(query, 'utf-8'));
      } catch (error) {
        httpLogger.error(`[ONVIF] responseSetPreset : ${errorToJson(error)}`);
        reject();
      }
    });
  }
}
