import { NetworkPayload } from '@common/interface/network/network.interface';
import httpLogger from '@common/logger/http.logger';
import { errorToJson } from '@common/util/error.util';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import { HttpStatus, Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as wifi from 'node-wifi';
import { WiFiNetwork } from 'node-wifi';

@Injectable()
export class NetworkService {
  constructor() {
    wifi.init({
      iface: null, // 디폴트 네트워크 인터페이스를 사용합니다.
    });
    this.isPlatformMac = process.platform === 'darwin';
    this.wifiScan();
    this.getNetwork();
  }

  private wifi_list: WiFiNetwork[] = [];
  private curEthernet: NetworkPayload[] = [];
  private curWifi: NetworkPayload[] = [];
  private curBluetooth: NetworkPayload[] = [];
  private isPlatformMac = false;

  async wifiScan() {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.isPlatformMac) {
          // Mac에서는 airport 명령어 사용
          exec(
            '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s',
            (err) => {
              if (err) {
                httpLogger.error(
                  `[NETOWRK] WifiScan1 Mac: ${errorToJson(err)}`,
                );
              }
              this.scanWifiNetworks(resolve, reject);
            },
          );
        } else {
          exec('nmcli dev wifi rescan', (err) => {
            if (err) {
              httpLogger.error(`[NETOWRK] WifiScan1: ${errorToJson(err)}`);
            }
            // Wi-Fi 검색 및 연결된 네트워크 정보 가져오기
            wifi.scan((error, networks) => {
              if (error) {
                httpLogger.error(`[NETOWRK] WifiScan2: ${errorToJson(error)}`);
                reject();
              } else {
                this.wifi_list = [];
                for (const net of networks) {
                  let flag = false;
                  if (net.ssid != '') {
                    for (let w of this.wifi_list) {
                      if (w.ssid == net.ssid) {
                        if (w.quality > net.quality) {
                          flag = true;
                        } else {
                          w = net;
                          flag = true;
                        }
                        break;
                      }
                    }
                    if (!flag) {
                      this.wifi_list.push({ ...net });
                    }
                  }
                }
                resolve(this.wifi_list);
              }
            });
          });
        }
      } catch (error) {
        httpLogger.error(`[NETOWRK] WifiScan3: ${errorToJson(error)}`);
        reject();
      }
    });
  }

  private scanWifiNetworks(resolve, reject) {
    // Wi-Fi 검색 및 연결된 네트워크 정보 가져오기
    wifi.scan((error, networks) => {
      if (error) {
        httpLogger.error(`[NETOWRK] WifiScan2: ${errorToJson(error)}`);
        reject();
      } else {
        this.wifi_list = [];
        for (const net of networks) {
          let flag = false;
          if (net.ssid != '') {
            for (let w of this.wifi_list) {
              if (w.ssid == net.ssid) {
                if (w.quality > net.quality) {
                  flag = true;
                } else {
                  w = net;
                  flag = true;
                }
                break;
              }
            }
            if (!flag) {
              this.wifi_list.push({ ...net });
            }
          }
        }
        resolve(this.wifi_list);
      }
    });
  }

  async getWifiList() {
    return this.wifi_list;
  }
  //   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;
  async getNetwork() {
    return new Promise(async (resolve, reject) => {
      if (this.isPlatformMac) {
        // Mac에서는 ifconfig 및 networksetup 명령어 사용
        exec(
          'ifconfig && networksetup -listallhardwareports',
          async (err, stdout) => {
            if (err) {
              httpLogger.error(`[NETOWRK] getNetwork Mac: ${errorToJson(err)}`);
              reject({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                data: {
                  message:
                    HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                },
              });
            } else {
              try {
                this.curEthernet = [];
                this.curWifi = [];
                this.curBluetooth = [];

                // Mac 네트워크 정보 파싱
                await this.parseMacNetworkInfo(stdout);

                //wifi
                const wifi_detail = await this.getCurrentWifi();

                for (let i = 0; i < wifi_detail.length; i++) {
                  if (this.curWifi.length > i) {
                    this.curWifi[i].signal_level = wifi_detail[i].signal_level;
                    this.curWifi[i].quality = wifi_detail[i].quality;
                    this.curWifi[i].security = wifi_detail[i].security;
                  }
                }

                resolve({
                  ethernet: this.curEthernet,
                  wifi: this.curWifi,
                  bt: this.curBluetooth,
                });
              } catch (error) {
                httpLogger.error(
                  `[NETOWRK] getNetwork Mac: ${errorToJson(error)}`,
                );
                reject();
              }
            }
          },
        );
      } else {
        exec('nmcli device show', async (err, stdout) => {
          if (err) {
            httpLogger.error(`[NETOWRK] getNetwork: ${errorToJson(err)}`);
            reject({
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              data: {
                message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
              },
            });
          } else {
            try {
              this.curEthernet = [];
              this.curWifi = [];
              this.curBluetooth = [];
              const networks = stdout.split(/\n\s*\n/);

              for (const i in networks) {
                const json = await this.transNMCLI(networks[i]);
                if (json.type == 'ethernet') {
                  this.curEthernet.push({ ...json });
                  global.ip_ethernet = json.ip;
                } else if (json.type == 'wifi') {
                  this.curWifi.push({ ...json });
                  global.ip_wifi = json.ip;
                } else if (json.type == 'bt') {
                  this.curBluetooth.push({ ...json });
                }
              }
              //wifi
              const wifi_detail = await this.getCurrentWifi();

              for (let i = 0; i < wifi_detail.length; i++) {
                if (this.curWifi.length > i) {
                  this.curWifi[i].signal_level = wifi_detail[i].signal_level;
                  this.curWifi[i].quality = wifi_detail[i].quality;
                  this.curWifi[i].security = wifi_detail[i].security;
                }
              }

              resolve({
                ethernet: this.curEthernet,
                wifi: this.curWifi,
                bt: this.curBluetooth,
              });
            } catch (error) {
              httpLogger.error(`[NETOWRK] getNetwork: ${errorToJson(error)}`);
              reject();
            }
          }
        });
      }
    });
  }

  async parseMacNetworkInfo(inputString: string) {
    try {
      const interfaces = inputString.split(/en\d+:/);

      for (const iface of interfaces) {
        if (!iface.trim()) continue;

        const network: NetworkPayload = {
          device: '',
          type: '',
          hwAddr: '',
          name: '',
          state: '',
          ip: '',
          mask: '',
          gateway: '',
          dns: [],
        };

        // Mac 인터페이스 정보 파싱 로직
        if (iface.includes('status: active')) {
          // 인터페이스 이름 추출
          const deviceMatch = iface.match(/^([a-zA-Z0-9]+)/);
          if (deviceMatch) network.device = 'en' + deviceMatch[1];

          // MAC 주소 추출
          const macMatch = iface.match(/ether\s+([0-9a-f:]+)/i);
          if (macMatch) network.hwAddr = macMatch[1];

          // IP 주소 추출
          const ipMatch = iface.match(/inet\s+(\d+\.\d+\.\d+\.\d+)/);
          if (ipMatch) network.ip = ipMatch[1];

          // 넷마스크 추출
          const maskMatch = iface.match(/netmask\s+0x([0-9a-f]+)/i);
          if (maskMatch) {
            const hexMask = maskMatch[1];
            // 16진수 넷마스크를 CIDR 표기법으로 변환
            const cidr = this.hexMaskToCidr(hexMask);
            network.mask = cidr.toString();
          }

          // 타입 결정 (Wi-Fi 또는 이더넷)
          if (
            iface.toLowerCase().includes('wi-fi') ||
            iface.includes('airport')
          ) {
            network.type = 'wifi';
            network.name = 'Wi-Fi';
            this.curWifi.push(network);
          } else {
            network.type = 'ethernet';
            network.name = 'Ethernet';
            this.curEthernet.push(network);
          }

          network.state = 'connected';
        }
      }

      // DNS 정보 가져오기 (Mac에서는 별도 명령어 필요)
      exec('scutil --dns', (err, stdout) => {
        if (!err && stdout) {
          const dnsMatches = stdout.match(
            /nameserver\[0-9]+\s*:\s*(\d+\.\d+\.\d+\.\d+)/g,
          );
          if (dnsMatches) {
            const dnsServers = dnsMatches.map((match) => {
              const parts = match.split(':');
              return parts[1].trim();
            });

            // DNS 서버 정보 추가
            this.curWifi.forEach((net) => {
              net.dns = [...dnsServers];
            });
            this.curEthernet.forEach((net) => {
              net.dns = [...dnsServers];
            });
          }
        }
      });

      // 게이트웨이 정보 가져오기
      exec('netstat -nr | grep default', (err, stdout) => {
        if (!err && stdout) {
          const gatewayMatch = stdout.match(/default\s+(\d+\.\d+\.\d+\.\d+)/);
          if (gatewayMatch) {
            const gateway = gatewayMatch[1];
            this.curWifi.forEach((net) => {
              net.gateway = gateway;
            });
            this.curEthernet.forEach((net) => {
              net.gateway = gateway;
            });
          }
        }
      });
    } catch (error) {
      httpLogger.error(`[NETWORK] parseMacNetworkInfo: ${errorToJson(error)}`);
    }
  }

  hexMaskToCidr(hexMask: string): number {
    // 16진수 넷마스크를 CIDR 표기법으로 변환
    let binary = '';
    for (let i = 0; i < hexMask.length; i++) {
      binary += parseInt(hexMask[i], 16).toString(2).padStart(4, '0');
    }
    return binary.split('1').length - 1;
  }

  async transNMCLI(inputString: string) {
    return new Promise<NetworkPayload>(async (resolve, reject) => {
      try {
        const network: NetworkPayload = {
          device: '',
          type: '',
          hwAddr: '',
          name: '',
          state: '',
          ip: '',
          mask: '',
          gateway: '',
          dns: [],
        };
        // 입력 문자열을 줄 단위로 분할하여 처리
        // network.dns = [];
        inputString.split('\n').forEach((line) => {
          // 각 줄을 ':'을 기준으로 키(key)와 값(value)으로 분리
          const split_str = line.split(':');
          const keyWithValue = split_str.shift().trim();
          let value;
          if (split_str.length > 1) {
            let string = '';
            while (split_str.length > 0) {
              const st = split_str.shift().trim();
              string += st + ':';
            }
            value = string.slice(0, -1);
          } else if (split_str.length == 0) {
            value = '';
          } else {
            value = split_str.shift().trim();
          }

          if (keyWithValue == 'GENERAL.DEVICE') {
            network.device = value;
          } else if (keyWithValue == 'GENERAL.TYPE') {
            network.type = value;
          } else if (keyWithValue == 'GENERAL.HWADDR') {
            network.hwAddr = value;
          } else if (keyWithValue == 'GENERAL.STATE') {
            network.state = value;
          } else if (keyWithValue == 'GENERAL.CONNECTION') {
            network.name = value;
          } else if (keyWithValue == 'IP4.ADDRESS[1]') {
            network.ip = value.split('/')[0];
            network.mask = value.split('/')[1];
          } else if (keyWithValue == 'IP4.GATEWAY') {
            network.gateway = value;
          } else if (keyWithValue.includes('IP4.DNS')) {
            network.dns.push(value);
          }
        });
        resolve(network);
      } catch (error) {
        httpLogger.error(`[NETWORK] transNMCLI: ${errorToJson(error)}`);
        reject();
      }
    });
  }

  async getCurrentWifi() {
    return new Promise<WiFiNetwork[]>(async (resolve, reject) => {
      try {
        // Wi-Fi 검색 및 연결된 네트워크 정보 가져오기
        wifi.getCurrentConnections((error, networks) => {
          if (error) {
            httpLogger.error(`[NETWORK] getCurrentWifi: ${errorToJson(error)}`);
            reject();
          } else {
            httpLogger.debug(
              `[NETWORK] getCurrentWifi: ${JSON.stringify(networks)}`,
            );
            resolve(networks);
          }
        });
      } catch (error) {
        httpLogger.error(`[NETWORK] getCurrentWifi: ${errorToJson(error)}`);
        reject();
      }
    });
  }

  async setIP(info) {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.isPlatformMac) {
          // Mac에서 IP 설정
          const cmd = `sudo networksetup -setmanual "${info.name}" ${info.ip} ${this.cidrToNetmask(info.mask)} ${info.gateway}`;

          httpLogger.info(
            `[NETWORK] SET IP Mac: ${cmd}, ${JSON.stringify(info)}`,
          );
          exec(cmd, async (err) => {
            if (err) {
              httpLogger.error('[NETWORK] SET IP Mac: ', errorToJson(err));
              reject();
            } else {
              // DNS 설정
              let dnsCmd = `sudo networksetup -setdnsservers "${info.name}"`;
              for (const dns of info.dns) {
                dnsCmd += ` ${dns}`;
              }

              exec(dnsCmd, (dnsErr, dnsStdout) => {
                if (dnsErr) {
                  httpLogger.error(
                    `[NETWORK] SET DNS Mac: ${errorToJson(dnsErr)}`,
                  );
                  reject();
                } else {
                  httpLogger.debug(
                    `[NETWORK] setIP Mac Response: ${dnsStdout}`,
                  );
                  resolve(dnsStdout);
                }
              });
            }
          });
        } else {
          let dns_str = '"';
          for (let i = 0; i < info.dns.length; i++) {
            dns_str += info.dns[i] + ' ';
          }
          dns_str += '"';
          const cmd =
            "sudo nmcli con modify '" +
            info.name +
            "' ipv4.addresses " +
            info.ip +
            '/' +
            info.mask +
            ' ipv4.gateway ' +
            info.gateway +
            ' ipv4.dns ' +
            dns_str +
            ' ipv4.method manual';

          httpLogger.info(`[NETWORK] SET IP: ${cmd}, ${JSON.stringify(info)}`);
          exec(cmd, async (err) => {
            if (err) {
              httpLogger.error('[NETWORK] SET IP: ', errorToJson(err));
              reject();
            } else {
              exec(
                'sudo nmcli device up "' + info.device + '"',
                async (err, stdout) => {
                  if (err) {
                    httpLogger.error(
                      `[NETWORK] SET IP: ${cmd}, ${errorToJson(err)}`,
                    );
                    reject();
                  } else {
                    httpLogger.debug(`[NETWORK] setIP Response: ${stdout}`);
                    resolve(stdout);
                  }
                },
              );
            }
          });
        }
      } catch (error) {
        httpLogger.error(`[NETWORK] SET IP: ${errorToJson(error)}`);
        reject(error);
      }
    });
  }

  cidrToNetmask(cidr: string): string {
    // CIDR 표기법을 넷마스크로 변환 (예: 24 -> 255.255.255.0)
    const cidrNum = parseInt(cidr, 10);
    const mask = [];
    for (let i = 0; i < 4; i++) {
      const n = Math.min(cidrNum - i * 8, 8);
      mask.push(n <= 0 ? 0 : 256 - Math.pow(2, 8 - n));
    }
    return mask.join('.');
  }

  async connectWifi(info) {
    return new Promise(async (resolve, reject) => {
      try {
        let cmd_line;

        if (this.isPlatformMac) {
          // Mac에서 Wi-Fi 연결
          if (info.password == undefined || info.password == '') {
            cmd_line = `sudo networksetup -setairportnetwork en0 "${info.ssid}"`;
          } else {
            cmd_line = `sudo networksetup -setairportnetwork en0 "${info.ssid}" "${info.password}"`;
          }
        } else {
          if (info.password == undefined || info.password == '') {
            cmd_line = 'sudo -S nmcli dev wifi connect "' + info.ssid + '"';
            // 'echo "rainbow" | sudo -S nmcli dev wifi connect "' + info.ssid + '"';
          } else {
            cmd_line =
              'sudo -S nmcli dev wifi connect "' +
              info.ssid +
              '" password "' +
              info.password +
              '"';
          }
        }

        httpLogger.info(
          `[NETWORK] Connect Wifi : ${cmd_line}, ${JSON.stringify(info)}`,
        );
        exec(cmd_line, async (err, stdout) => {
          if (err) {
            httpLogger.error(`[NETWORK] Connect Wifi: ${errorToJson(err)}`);
            if (err.toString().includes('Secrets were required')) {
              reject({
                ...info,
                data: {
                  message:
                    HttpStatusMessagesConstants.NETWORK
                      .FAIL_CONNECT_PASSWORD_400,
                },
                status: HttpStatus.BAD_REQUEST,
              });
            } else if (err.toString().includes('property is invalid')) {
              reject({
                ...info,
                data: {
                  message:
                    HttpStatusMessagesConstants.NETWORK
                      .FAIL_CONNECT_PASSWORD_400,
                },
                status: HttpStatus.BAD_REQUEST,
              });
            } else {
              reject({
                ...info,
                data: {
                  stdout: err,
                  message: HttpStatusMessagesConstants.NETWORK.FAIL_CONNECT_500,
                },
                status: HttpStatus.INTERNAL_SERVER_ERROR,
              });
            }
          } else {
            httpLogger.info(`[NETWORK] Connect Wifi Response: ${stdout}`);
            if (stdout.includes('successfully')) {
              resolve({
                ...info,
                message:
                  HttpStatusMessagesConstants.NETWORK.SUCCESS_CONNECT_200,
              });
            } else if (stdout.includes('Secrets were required')) {
              reject({
                ...info,
                data: {
                  message:
                    HttpStatusMessagesConstants.NETWORK
                      .FAIL_CONNECT_PASSWORD_400,
                },
                status: HttpStatus.BAD_REQUEST,
              });
            } else if (stdout.includes('property is invalid')) {
              reject({
                ...info,
                data: {
                  message:
                    HttpStatusMessagesConstants.NETWORK
                      .FAIL_CONNECT_PASSWORD_400,
                },
                status: HttpStatus.BAD_REQUEST,
              });
            } else {
              reject({
                ...info,
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                data: {
                  stdout: stdout,
                  message: HttpStatusMessagesConstants.NETWORK.FAIL_CONNECT_500,
                },
              });
            }
          }
        });
      } catch (error) {
        httpLogger.warn(`[NETWORK] Connect Wifi: ${JSON.stringify(error)}`);
        if (error.toString().includes('Secrets were required')) {
          resolve({
            ...info,
            result: 'fail',
            message: 'Secrets were required, but not provided',
          });
        } else if (error.toString().includes('property is invalid')) {
          resolve({
            ...info,
            result: 'fail',
            message: 'Secrets were required, but not invalid',
          });
        } else {
          resolve(error);
        }
      }
    });
  }
}
