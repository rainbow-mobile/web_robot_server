import { defaultNetwork, NetworkPayload } from '@common/interface/network/network.interface';
import httpLogger from '@common/logger/http.logger';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import { HttpStatus, Injectable } from '@nestjs/common';
import { exec, execSync } from 'child_process';
import * as moment from 'moment';
import * as wifi from 'node-wifi';
import { WiFiNetwork } from 'node-wifi';

@Injectable()
export class NetworkService {
    constructor(){
        wifi.init({
            iface: null, // 디폴트 네트워크 인터페이스를 사용합니다.
        });
        this.wifiScan();
        this.getNetwork();
    }

    private wifi_list:WiFiNetwork[] = [];
    private curEthernet:NetworkPayload[] = [];
    private curWifi:NetworkPayload[] = [];
    private curBluetooth:NetworkPayload[] = [];

    async wifiScan() {
        return new Promise(async (resolve, reject) => {
          try {
            exec("nmcli dev wifi rescan", (err) => {
                httpLogger.error(`[NETOWRK] WifiScan: ${JSON.stringify(err)}`)
              // Wi-Fi 검색 및 연결된 네트워크 정보 가져오기
              wifi.scan((error, networks) => {
                if (error) {
                  httpLogger.error(`[NETOWRK] WifiScan: ${JSON.stringify(error)}`)
                  reject();
                } else {
                  this.wifi_list = [];
                  for (const net of networks) {
                    var flag = false;
                    if (net.ssid != "") {
                      for (var w of this.wifi_list) {
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
                        this.wifi_list.push({...net});
                      }
                    }
                  }
                  resolve(this.wifi_list);
                }
              });
            });
          } catch (error) {
            httpLogger.error(`[NETOWRK] WifiScan: ${JSON.stringify(error)}`)
            reject();
          }
        });
      }

    async getWifiList() {
        return this.wifi_list;
      }

    async getNetwork(){
        return new Promise(async (resolve, reject) => {
            exec("nmcli device show", async(err, stdout, stderr) => {
                if (err) {
                    httpLogger.error(`[NETOWRK] getNetwork: ${JSON.stringify(err)}`)
                    reject({status:HttpStatus.INTERNAL_SERVER_ERROR,data:{message:HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500}});
                } else {
                    try {
                        this.curEthernet = [];
                        this.curWifi = [];
                        this.curBluetooth = [];
                        const networks = stdout.split(/\n\s*\n/);
                        let test:NetworkPayload[]=[];
                        for (const i in networks) {
                            let json = await this.transNMCLI(networks[i]);
                            if (json.type == 'ethernet') {
                                this.curEthernet.push({...json})
                                global.ip_ethernet = json.ip;
                            } else if (json.type == 'wifi') {
                                this.curWifi.push({...json});
                                global.ip_wifi = json.ip;
                            } else if (json.type == "bt") {
                                this.curBluetooth.push({...json});
                            }
                        }
                        //wifi
                        const wifi_detail = await this.getCurrentWifi();

                        for(var i=0; i<wifi_detail.length;i++){
                            if(this.curWifi.length > i){
                                this.curWifi[i].signal_level = wifi_detail[i].signal_level;
                                this.curWifi[i].quality = wifi_detail[i].quality;
                                this.curWifi[i].security = wifi_detail[i].security;
                            }
                        }
                        
                        resolve({ethernet:this.curEthernet,wifi:this.curWifi,bt:this.curBluetooth});
                    } catch (error) {
                        httpLogger.error(`[NETOWRK] getNetwork: ${JSON.stringify(error)}`)
                    reject();
                    }
                }
            });
        });
    }

    async transNMCLI(inputString:string){
        return new Promise<NetworkPayload>(async (resolve, reject) => {
            try {
                let network:NetworkPayload = defaultNetwork;
                // 입력 문자열을 줄 단위로 분할하여 처리
                inputString.split("\n").forEach((line) => {
                    // 각 줄을 ':'을 기준으로 키(key)와 값(value)으로 분리
                    const split_str = line.split(":");
                    const keyWithValue = split_str.shift().trim();
                    let value;
                    if (split_str.length > 1) {
                        var string = "";
                        while (split_str.length > 0) {
                        const st = split_str.shift().trim();
                            string += st + ":";
                        }
                        value = string.slice(0, -1);
                    } else if (split_str.length == 0) {
                        value = "";
                    } else {
                        value = split_str.shift().trim();
                    }
            
                    if(keyWithValue == "GENERAL.DEVICE"){
                        network.device = value;
                    }else if(keyWithValue == "GENERAL.TYPE"){
                        network.type = value;
                    }else if(keyWithValue == "GENERAL.HWADDR"){
                        network.hwAddr = value;
                    }else if(keyWithValue == "GENERAL.STATE"){
                        network.state = value;
                    }else if(keyWithValue == "GENERAL.CONNECTION"){
                        network.name = value;
                    }else if(keyWithValue == "IP4.ADDRESS[1]"){
                        network.ip = value.split('/')[0];
                        network.mask = value.split('/')[1];
                    }else if(keyWithValue == "IP4.GATEWAY"){
                        network.gateway = value;
                    }else if(keyWithValue.includes("IP4.DNS")){
                        network.dns.push(value);
                    }
                    
                });
                resolve(network);
            } catch (error) {
                httpLogger.error(`[NETWORK] transNMCLI: ${JSON.stringify(error)}`)
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
                httpLogger.error(`[NETWORK] getCurrentConnections: ${JSON.stringify(error)}`)
                reject();
            } else {
                resolve(networks);
            }
            });
        } catch (error) {
            httpLogger.error(`[NETWORK] getCurrentConnections: ${JSON.stringify(error)}`)
            reject();
        }
        });
    }
  
    async setIP(info) {
        return new Promise(async (resolve, reject) => {
        try {
            let dns_str = '"';
            for (var i = 0; i < info.dns.length; i++) {
            dns_str += info.dns[i] + " ";
            }
            dns_str += '"';
            const cmd =
            "sudo nmcli con modify '" +
            info.name +
            "' ipv4.addresses " +
            info.ip +
            "/" +
            info.mask +
            " ipv4.gateway " +
            info.gateway +
            " ipv4.dns " +
            dns_str +
            " ipv4.method manual";
    
            httpLogger.info(`[NETWORK] SET IP: ${cmd}, ${JSON.stringify(info)}`);
            exec(cmd, async (err, stdout, stderr) => {
            if (err) {
                httpLogger.error("SET IP Error : ", err);
                reject();
            } else {
                exec(
                'sudo nmcli device up "' + info.device + '"',
                async (err, stdout, stderr) => {
                    if (err) {
                        httpLogger.error(`[NETWORK] SET IP: ${cmd}, ${JSON.stringify(err)}`);
                        reject();
                    } else {
                        httpLogger.debug(`[NETWORK] setIP Response: ${stdout}`)
                        resolve(stdout);
                    }
                }
                );
            }
            });
        } catch (error) {
            httpLogger.error(`[NETWORK] SET IP: ${JSON.stringify(error)}`);
            reject(error);
        }
        });
    }
      
    async connectWifi(info) {
    return new Promise(async (resolve, reject) => {
        try {
            let cmd_line;
            if (info.password == undefined || info.password == "") {
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
            httpLogger.info(`[NETWORK] Connect Wifi : ${cmd_line}, ${JSON.stringify(info)}`);
            exec(cmd_line, async (err, stdout, stderr) => {
                if (err) {
                    httpLogger.error(`[NETWORK] Connect Wifi: ${JSON.stringify(err)}`);
                    if (err.toString().includes("Secrets were required")) {
                        reject({...info,
                            data:{message: HttpStatusMessagesConstants.NETWORK.FAIL_CONNECT_PASSWORD_400},
                            status: HttpStatus.BAD_REQUEST
                        })
                    } else if (err.toString().includes("property is invalid")) {
                        reject({...info,
                            data:{message: HttpStatusMessagesConstants.NETWORK.FAIL_CONNECT_PASSWORD_400},
                            status: HttpStatus.BAD_REQUEST
                        })
                    } else {
                        reject({...info,
                            data:{stdout:err,message: HttpStatusMessagesConstants.NETWORK.FAIL_CONNECT_500},
                            status: HttpStatus.INTERNAL_SERVER_ERROR
                        })
                    }
                } else {
                    httpLogger.info(`[NETWORK] Connect Wifi Response: ${stdout}`);
                    if (stdout.includes("successfully")) {
                        resolve({...info, message: HttpStatusMessagesConstants.NETWORK.SUCCESS_CONNECT_200 });
                    } else if (stdout.includes("Secrets were required")) {
                        reject({...info,
                            data:{message: HttpStatusMessagesConstants.NETWORK.FAIL_CONNECT_PASSWORD_400},
                            status: HttpStatus.BAD_REQUEST
                        })
                    } else if (stdout.includes("property is invalid")) {
                        reject({...info,
                            data:{message: HttpStatusMessagesConstants.NETWORK.FAIL_CONNECT_PASSWORD_400},
                            status: HttpStatus.BAD_REQUEST
                        })
                    } else {
                        reject({...info,
                            status: HttpStatus.INTERNAL_SERVER_ERROR,
                            data: {stdout:stdout,message: HttpStatusMessagesConstants.NETWORK.FAIL_CONNECT_500}
                        })
                    }
                }
            });
        } catch (error) {
            httpLogger.warn(`[NETWORK] Connect Wifi: ${JSON.stringify(error)}`);
            if (error.toString().includes("Secrets were required")) {
                resolve({
                    ...info,
                    result: "fail",
                    message: "Secrets were required, but not provided",
                });
            } else if (error.toString().includes("property is invalid")) {
                resolve({
                    ...info,
                    result: "fail",
                    message: "Secrets were required, but not invalid",
                });
            } else {
                resolve(error);
            }
        }
    });
}
}
