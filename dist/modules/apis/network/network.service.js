"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkService = void 0;
const http_logger_1 = require("../../../common/logger/http.logger");
const error_util_1 = require("../../../common/util/error.util");
const http_status_messages_constants_1 = require("../../../common/constants/http-status-messages.constants");
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const wifi = require("node-wifi");
let NetworkService = class NetworkService {
    constructor() {
        this.wifi_list = [];
        this.curEthernet = [];
        this.curWifi = [];
        this.curBluetooth = [];
        this.isPlatformMac = false;
        this.isPlatformWindows = false;
        wifi.init({
            iface: null,
        });
        this.isPlatformMac = process.platform === 'darwin';
        this.isPlatformWindows = process.platform.includes('win');
        console.log(process.platform);
        this.NetworkInit();
    }
    async NetworkInit() {
        try {
            await this.wifiScan();
            await this.getNetwork();
        }
        catch (error) { }
    }
    async wifiScan() {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.isPlatformMac) {
                    (0, child_process_1.exec)('/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -s', (err) => {
                        if (err) {
                            http_logger_1.default.error(`[NETOWRK] WifiScan1 Mac: ${(0, error_util_1.errorToJson)(err)}`);
                        }
                        this.scanWifiNetworks(resolve, reject);
                    });
                }
                else if (this.isPlatformWindows) {
                    reject('windows');
                }
                else {
                    (0, child_process_1.exec)('sudo nmcli device wifi list --rescan yes', (err) => {
                        if (err) {
                            http_logger_1.default.error(`[NETOWRK] WifiScan1: ${(0, error_util_1.errorToJson)(err)}`);
                        }
                        wifi.scan((error, networks) => {
                            if (error) {
                                http_logger_1.default.error(`[NETOWRK] WifiScan2: ${(0, error_util_1.errorToJson)(error)}`);
                                reject();
                            }
                            else {
                                this.wifi_list = [];
                                for (const net of networks) {
                                    let flag = false;
                                    if (net.ssid != '') {
                                        for (let w of this.wifi_list) {
                                            if (w.ssid == net.ssid) {
                                                if (w.quality > net.quality) {
                                                    flag = true;
                                                }
                                                else {
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
            }
            catch (error) {
                http_logger_1.default.error(`[NETOWRK] WifiScan3: ${(0, error_util_1.errorToJson)(error)}`);
                reject();
            }
        });
    }
    scanWifiNetworks(resolve, reject) {
        wifi.scan((error, networks) => {
            if (error) {
                http_logger_1.default.error(`[NETOWRK] WifiScan2: ${(0, error_util_1.errorToJson)(error)}`);
                reject();
            }
            else {
                this.wifi_list = [];
                for (const net of networks) {
                    let flag = false;
                    if (net.ssid != '') {
                        for (let w of this.wifi_list) {
                            if (w.ssid == net.ssid) {
                                if (w.quality > net.quality) {
                                    flag = true;
                                }
                                else {
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
    async getNetwork() {
        return new Promise(async (resolve, reject) => {
            if (this.isPlatformMac) {
                (0, child_process_1.exec)('ifconfig && networksetup -listallhardwareports', async (err, stdout) => {
                    if (err) {
                        http_logger_1.default.error(`[NETOWRK] getNetwork Mac: ${(0, error_util_1.errorToJson)(err)}`);
                        reject({
                            status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                            data: {
                                message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                            },
                        });
                    }
                    else {
                        try {
                            this.curEthernet = [];
                            this.curWifi = [];
                            this.curBluetooth = [];
                            await this.parseMacNetworkInfo(stdout);
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
                        }
                        catch (error) {
                            http_logger_1.default.error(`[NETOWRK] getNetwork Mac: ${(0, error_util_1.errorToJson)(error)}`);
                            reject();
                        }
                    }
                });
            }
            else if (this.isPlatformWindows) {
                reject('windows');
            }
            else {
                (0, child_process_1.exec)('nmcli device show', async (err, stdout) => {
                    if (err) {
                        http_logger_1.default.error(`[NETOWRK] getNetwork: ${(0, error_util_1.errorToJson)(err)}`);
                        reject({
                            status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                            data: {
                                message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                            },
                        });
                    }
                    else {
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
                                }
                                else if (json.type == 'wifi') {
                                    this.curWifi.push({ ...json });
                                    global.ip_wifi = json.ip;
                                }
                                else if (json.type == 'bt') {
                                    this.curBluetooth.push({ ...json });
                                }
                            }
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
                        }
                        catch (error) {
                            http_logger_1.default.error(`[NETOWRK] getNetwork: ${(0, error_util_1.errorToJson)(error)}`);
                            reject();
                        }
                    }
                });
            }
        });
    }
    async parseMacNetworkInfo(inputString) {
        try {
            const interfaces = inputString.split(/en\d+:/);
            for (const iface of interfaces) {
                if (!iface.trim())
                    continue;
                const network = {
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
                if (iface.includes('status: active')) {
                    const deviceMatch = iface.match(/^([a-zA-Z0-9]+)/);
                    if (deviceMatch)
                        network.device = 'en' + deviceMatch[1];
                    const macMatch = iface.match(/ether\s+([0-9a-f:]+)/i);
                    if (macMatch)
                        network.hwAddr = macMatch[1];
                    const ipMatch = iface.match(/inet\s+(\d+\.\d+\.\d+\.\d+)/);
                    if (ipMatch)
                        network.ip = ipMatch[1];
                    const maskMatch = iface.match(/netmask\s+0x([0-9a-f]+)/i);
                    if (maskMatch) {
                        const hexMask = maskMatch[1];
                        const cidr = this.hexMaskToCidr(hexMask);
                        network.mask = cidr.toString();
                    }
                    if (iface.toLowerCase().includes('wi-fi') ||
                        iface.includes('airport')) {
                        network.type = 'wifi';
                        network.name = 'Wi-Fi';
                        this.curWifi.push(network);
                    }
                    else {
                        network.type = 'ethernet';
                        network.name = 'Ethernet';
                        this.curEthernet.push(network);
                    }
                    network.state = 'connected';
                }
            }
            (0, child_process_1.exec)('scutil --dns', (err, stdout) => {
                if (!err && stdout) {
                    const dnsMatches = stdout.match(/nameserver\[0-9]+\s*:\s*(\d+\.\d+\.\d+\.\d+)/g);
                    if (dnsMatches) {
                        const dnsServers = dnsMatches.map((match) => {
                            const parts = match.split(':');
                            return parts[1].trim();
                        });
                        this.curWifi.forEach((net) => {
                            net.dns = [...dnsServers];
                        });
                        this.curEthernet.forEach((net) => {
                            net.dns = [...dnsServers];
                        });
                    }
                }
            });
            (0, child_process_1.exec)('netstat -nr | grep default', (err, stdout) => {
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
        }
        catch (error) {
            http_logger_1.default.error(`[NETWORK] parseMacNetworkInfo: ${(0, error_util_1.errorToJson)(error)}`);
        }
    }
    hexMaskToCidr(hexMask) {
        let binary = '';
        for (let i = 0; i < hexMask.length; i++) {
            binary += parseInt(hexMask[i], 16).toString(2).padStart(4, '0');
        }
        return binary.split('1').length - 1;
    }
    async transNMCLI(inputString) {
        return new Promise(async (resolve, reject) => {
            try {
                const network = {
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
                inputString.split('\n').forEach((line) => {
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
                    }
                    else if (split_str.length == 0) {
                        value = '';
                    }
                    else {
                        value = split_str.shift().trim();
                    }
                    if (keyWithValue == 'GENERAL.DEVICE') {
                        network.device = value;
                    }
                    else if (keyWithValue == 'GENERAL.TYPE') {
                        network.type = value;
                    }
                    else if (keyWithValue == 'GENERAL.HWADDR') {
                        network.hwAddr = value;
                    }
                    else if (keyWithValue == 'GENERAL.STATE') {
                        network.state = value;
                    }
                    else if (keyWithValue == 'GENERAL.CONNECTION') {
                        network.name = value;
                    }
                    else if (keyWithValue == 'IP4.ADDRESS[1]') {
                        network.ip = value.split('/')[0];
                        network.mask = value.split('/')[1];
                    }
                    else if (keyWithValue == 'IP4.GATEWAY') {
                        network.gateway = value;
                    }
                    else if (keyWithValue.includes('IP4.DNS')) {
                        network.dns.push(value);
                    }
                });
                resolve(network);
            }
            catch (error) {
                http_logger_1.default.error(`[NETWORK] transNMCLI: ${(0, error_util_1.errorToJson)(error)}`);
                reject();
            }
        });
    }
    async getCurrentWifi() {
        return new Promise(async (resolve, reject) => {
            try {
                wifi.getCurrentConnections((error, networks) => {
                    if (error) {
                        http_logger_1.default.error(`[NETWORK] getCurrentWifi: ${(0, error_util_1.errorToJson)(error)}`);
                        reject();
                    }
                    else {
                        http_logger_1.default.debug(`[NETWORK] getCurrentWifi: ${JSON.stringify(networks)}`);
                        resolve(networks);
                    }
                });
            }
            catch (error) {
                http_logger_1.default.error(`[NETWORK] getCurrentWifi: ${(0, error_util_1.errorToJson)(error)}`);
                reject();
            }
        });
    }
    async setIP(info) {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.isPlatformMac) {
                    const cmd = `sudo networksetup -setmanual "${info.name}" ${info.ip} ${this.cidrToNetmask(info.mask)} ${info.gateway}`;
                    http_logger_1.default.info(`[NETWORK] SET IP Mac: ${cmd}, ${JSON.stringify(info)}`);
                    (0, child_process_1.exec)(cmd, async (err) => {
                        if (err) {
                            http_logger_1.default.error('[NETWORK] SET IP Mac: ', (0, error_util_1.errorToJson)(err));
                            reject();
                        }
                        else {
                            let dnsCmd = `sudo networksetup -setdnsservers "${info.name}"`;
                            for (const dns of info.dns) {
                                dnsCmd += ` ${dns}`;
                            }
                            (0, child_process_1.exec)(dnsCmd, (dnsErr, dnsStdout) => {
                                if (dnsErr) {
                                    http_logger_1.default.error(`[NETWORK] SET DNS Mac: ${(0, error_util_1.errorToJson)(dnsErr)}`);
                                    reject();
                                }
                                else {
                                    http_logger_1.default.debug(`[NETWORK] setIP Mac Response: ${dnsStdout}`);
                                    resolve(dnsStdout);
                                }
                            });
                        }
                    });
                }
                else {
                    let dns_str = '"';
                    for (let i = 0; i < info.dns.length; i++) {
                        dns_str += info.dns[i] + ' ';
                    }
                    dns_str += '"';
                    const cmd = "sudo nmcli con modify '" +
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
                    http_logger_1.default.info(`[NETWORK] SET IP: ${cmd}, ${JSON.stringify(info)}`);
                    (0, child_process_1.exec)(cmd, async (err) => {
                        if (err) {
                            http_logger_1.default.error('[NETWORK] SET IP: ', (0, error_util_1.errorToJson)(err));
                            reject();
                        }
                        else {
                            (0, child_process_1.exec)('sudo nmcli device up "' + info.device + '"', async (err, stdout) => {
                                if (err) {
                                    http_logger_1.default.error(`[NETWORK] SET IP: ${cmd}, ${(0, error_util_1.errorToJson)(err)}`);
                                    reject();
                                }
                                else {
                                    http_logger_1.default.debug(`[NETWORK] setIP Response: ${stdout}`);
                                    resolve(stdout);
                                }
                            });
                        }
                    });
                }
            }
            catch (error) {
                http_logger_1.default.error(`[NETWORK] SET IP: ${(0, error_util_1.errorToJson)(error)}`);
                reject(error);
            }
        });
    }
    cidrToNetmask(cidr) {
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
                    if (info.password == undefined || info.password == '') {
                        cmd_line = `sudo networksetup -setairportnetwork en0 "${info.ssid}"`;
                    }
                    else {
                        cmd_line = `sudo networksetup -setairportnetwork en0 "${info.ssid}" "${info.password}"`;
                    }
                }
                else {
                    if (info.password == undefined || info.password == '') {
                        cmd_line = 'sudo -S nmcli dev wifi connect "' + info.ssid + '"';
                    }
                    else {
                        cmd_line =
                            'sudo -S nmcli dev wifi connect "' +
                                info.ssid +
                                '" password "' +
                                info.password +
                                '"';
                    }
                }
                http_logger_1.default.info(`[NETWORK] Connect Wifi : ${cmd_line}, ${JSON.stringify(info)}`);
                (0, child_process_1.exec)(cmd_line, async (err, stdout) => {
                    if (err) {
                        http_logger_1.default.error(`[NETWORK] Connect Wifi: ${(0, error_util_1.errorToJson)(err)}`);
                        if (err.toString().includes('Secrets were required')) {
                            reject({
                                ...info,
                                data: {
                                    message: http_status_messages_constants_1.HttpStatusMessagesConstants.NETWORK
                                        .FAIL_CONNECT_PASSWORD_400,
                                },
                                status: common_1.HttpStatus.BAD_REQUEST,
                            });
                        }
                        else if (err.toString().includes('property is invalid')) {
                            reject({
                                ...info,
                                data: {
                                    message: http_status_messages_constants_1.HttpStatusMessagesConstants.NETWORK
                                        .FAIL_CONNECT_PASSWORD_400,
                                },
                                status: common_1.HttpStatus.BAD_REQUEST,
                            });
                        }
                        else {
                            reject({
                                ...info,
                                data: {
                                    stdout: err,
                                    message: http_status_messages_constants_1.HttpStatusMessagesConstants.NETWORK.FAIL_CONNECT_500,
                                },
                                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                            });
                        }
                    }
                    else {
                        http_logger_1.default.info(`[NETWORK] Connect Wifi Response: ${stdout}`);
                        if (stdout.includes('successfully')) {
                            resolve({
                                ...info,
                                message: http_status_messages_constants_1.HttpStatusMessagesConstants.NETWORK.SUCCESS_CONNECT_200,
                            });
                        }
                        else if (stdout.includes('Secrets were required')) {
                            reject({
                                ...info,
                                data: {
                                    message: http_status_messages_constants_1.HttpStatusMessagesConstants.NETWORK
                                        .FAIL_CONNECT_PASSWORD_400,
                                },
                                status: common_1.HttpStatus.BAD_REQUEST,
                            });
                        }
                        else if (stdout.includes('property is invalid')) {
                            reject({
                                ...info,
                                data: {
                                    message: http_status_messages_constants_1.HttpStatusMessagesConstants.NETWORK
                                        .FAIL_CONNECT_PASSWORD_400,
                                },
                                status: common_1.HttpStatus.BAD_REQUEST,
                            });
                        }
                        else {
                            reject({
                                ...info,
                                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                                data: {
                                    stdout: stdout,
                                    message: http_status_messages_constants_1.HttpStatusMessagesConstants.NETWORK.FAIL_CONNECT_500,
                                },
                            });
                        }
                    }
                });
            }
            catch (error) {
                http_logger_1.default.warn(`[NETWORK] Connect Wifi: ${JSON.stringify(error)}`);
                if (error.toString().includes('Secrets were required')) {
                    resolve({
                        ...info,
                        result: 'fail',
                        message: 'Secrets were required, but not provided',
                    });
                }
                else if (error.toString().includes('property is invalid')) {
                    resolve({
                        ...info,
                        result: 'fail',
                        message: 'Secrets were required, but not invalid',
                    });
                }
                else {
                    resolve(error);
                }
            }
        });
    }
};
exports.NetworkService = NetworkService;
exports.NetworkService = NetworkService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], NetworkService);
//# sourceMappingURL=network.service.js.map