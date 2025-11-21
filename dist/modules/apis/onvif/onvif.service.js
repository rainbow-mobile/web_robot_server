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
exports.OnvifDeviceService = void 0;
const http_logger_1 = require("../../../common/logger/http.logger");
const error_util_1 = require("../../../common/util/error.util");
const common_1 = require("@nestjs/common");
const fs = require("fs");
const dgram = require("dgram");
const uuid_1 = require("uuid");
const os = require("os");
const xml2js = require("xml2js");
const sockets_gateway_1 = require("../../sockets/gateway/sockets.gateway");
const variables_service_1 = require("../variables/variables.service");
const child_process_1 = require("child_process");
const MULTICAST_ADDRESS = '239.255.255.250';
const PORT = 3702;
let OnvifDeviceService = class OnvifDeviceService {
    constructor(socketGateway, variableService) {
        this.socketGateway = socketGateway;
        this.variableService = variableService;
    }
    async onModuleInit() {
        this.server = dgram.createSocket({ type: 'udp4', reuseAddr: true });
        this.getVariables();
        this.server.on('message', (msg, rinfo) => {
            try {
                const parser = new xml2js.Parser({
                    explicitArray: false,
                    tagNameProcessors: [xml2js.processors.stripPrefix],
                });
                console.log('message in');
                parser.parseString(msg, (err, result) => {
                    if (err) {
                        console.log('Error parsing XML:', err);
                        return;
                    }
                    if (result['Envelope'] &&
                        result['Envelope']['Body'] &&
                        result['Envelope']['Header'] &&
                        result['Envelope']['Header']['MessageID']) {
                        if (result['Envelope']['Body']['Probe'] &&
                            JSON.stringify(result['Envelope']['Body']['Probe']['Types']).includes('Device')) {
                            console.log(rinfo);
                            console.log(`ONVIF Read : ${JSON.stringify(result)}`);
                            this.responseProbe(result, rinfo);
                        }
                    }
                });
            }
            catch (error) {
                console.error(error);
            }
        });
        this.server.bind(PORT, () => {
            console.log('Onvif bind');
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
            await this.variableService.upsertVariable('robotManufacturer', 'RainbowRobotics');
        }
        global.robotManufacturer =
            await this.variableService.getVariable('robotManufacturer');
        global.robotModel = await this.variableService.getVariable('robotModel');
        global.robotVersion =
            await this.variableService.getVariable('robotVersion');
        global.robotHardware =
            await this.variableService.getVariable('robotHardware');
    }
    getWSDLPath(category, filename) {
        return process.cwd() + '/src/common/wsdl/' + category + '/' + filename;
    }
    generateUUID() {
        return (0, uuid_1.v4)();
    }
    getXaddrs(url) {
        let xaddrs = '';
        this.getLocalIps().map((ip) => {
            xaddrs += this.getXaddr(ip, url) + ' ';
        });
        console.log(this.getLocalIps(), xaddrs);
        return xaddrs;
    }
    getXaddr(ip, url) {
        if (ip?.includes('::ffff:')) {
            ip = ip.split('::ffff:')[1];
        }
        return 'http://' + ip + ':11334/api/onvif/' + url;
    }
    getStream(ip, url) {
        if (ip.includes('::ffff:')) {
            ip = ip.split('::ffff:')[1];
        }
        return 'rtsp://' + ip + ':8554/' + url;
    }
    getLocalIp(clientIp) {
        if (clientIp.includes('::ffff:')) {
            clientIp = clientIp.split('::ffff:')[1];
        }
        const interfaces = os.networkInterfaces();
        for (const iface of Object.values(interfaces)) {
            for (const config of iface || []) {
                if (config.family === 'IPv4' && !config.internal) {
                    http_logger_1.default.info(`[ONVIF] getLocalIP : ${clientIp}, ${JSON.stringify(config)}`);
                    if (clientIp.startsWith(config.address.substring(0, config.address.lastIndexOf('.')))) {
                        return config;
                    }
                }
            }
        }
        return '127.0.0.1';
    }
    getLocalIps() {
        const interfaces = os.networkInterfaces();
        http_logger_1.default.info(`[ONVIF] interfaces : ${interfaces}`);
        const ips = [];
        for (const iface of Object.values(interfaces)) {
            for (const config of iface || []) {
                http_logger_1.default.info(`[ONVIF] config : ${config}`);
                if (config.family === 'IPv4' && !config.internal) {
                    http_logger_1.default.info(`[ONVIF] getLocalIps :  ${config.address}`);
                    ips.push(config.address);
                }
            }
        }
        return ips;
    }
    async hello() {
        let helloMsg = fs
            .readFileSync(this.getWSDLPath('device', 'hello.wsdl'))
            .toString();
        helloMsg = helloMsg.replace('__MESSAGE_ID__', this.generateUUID());
        helloMsg = helloMsg.replace('__ADDRESS__', global.robotSerial);
        helloMsg = helloMsg.replace('__XADDRS__', this.getXaddrs('device_service'));
        http_logger_1.default.debug(`[ONVIF] hello: ${helloMsg}`);
        await this.server.send(helloMsg, 0, helloMsg.length, PORT, MULTICAST_ADDRESS, (err) => {
            if (err)
                console.error('Error Sending Hello : ', err);
        });
    }
    async responseProbe(message, rinfo) {
        await this.getVariables();
        let probeMatchMsg = fs
            .readFileSync(this.getWSDLPath('device', 'probematches.wsdl'))
            .toString();
        probeMatchMsg = probeMatchMsg.replace('__MESSAGE_ID__', this.generateUUID());
        probeMatchMsg = probeMatchMsg.replace('__RELATES_TO__', message['Envelope']['Header']['MessageID']);
        probeMatchMsg = probeMatchMsg.replace('__INSTANCE_ID__', '6666336');
        probeMatchMsg = probeMatchMsg.replace('__MESSAGE_NUMBER__', '1');
        probeMatchMsg = probeMatchMsg.replace('__ADDRESS__', global.robotSerial);
        probeMatchMsg = probeMatchMsg.replace('__DEVICE_XADDRS__', this.getXaddrs('device_service'));
        const messageBuffer = Buffer.from(probeMatchMsg, 'utf-8');
        http_logger_1.default.info(`[ONVIF] responseProbe: ${probeMatchMsg}`);
        this.server.send(messageBuffer, 0, messageBuffer.length, rinfo.port, rinfo.address, (err) => {
            if (err)
                console.log('Error sending response:', err);
        });
    }
    async responseSystemDateAndTime() {
        return new Promise(async (resolve, reject) => {
            try {
                let query = fs
                    .readFileSync(this.getWSDLPath('device', 'dateandtime.wsdl'))
                    .toString();
                const nowTime = new Date();
                query = query.replace('__YEAR_UTC__', nowTime.getUTCFullYear().toString());
                query = query.replace('__MONTH_UTC__', (nowTime.getUTCMonth() + 1).toString());
                query = query.replace('__DAY_UTC__', nowTime.getUTCDate().toString());
                query = query.replace('__HOUR_UTC__', nowTime.getUTCHours().toString());
                query = query.replace('__MINUTE_UTC__', nowTime.getUTCMinutes().toString());
                query = query.replace('__SECOND_UTC__', nowTime.getUTCSeconds().toString());
                query = query.replace('__YEAR__', nowTime.getFullYear().toString());
                query = query.replace('__MONTH__', (nowTime.getMonth() + 1).toString());
                query = query.replace('__DAY__', nowTime.getDate().toString());
                query = query.replace('__HOUR__', nowTime.getHours().toString());
                query = query.replace('__MINUTE__', nowTime.getMinutes().toString());
                query = query.replace('__SECOND__', nowTime.getSeconds().toString());
                http_logger_1.default.debug(`[ONVIF] responseSystemDateAndTime: ${query}`);
                resolve(Buffer.from(query, 'utf-8'));
            }
            catch (error) {
                http_logger_1.default.error(`[ONVIF] responseSystemDateAndTime : ${(0, error_util_1.errorToJson)(error)}`);
                reject();
            }
        });
    }
    async setSystemDateAndTime() { }
    async responseCapabilities(_ip) {
        return new Promise(async (resolve, reject) => {
            try {
                const ip = this.getLocalIp(_ip).address;
                let query = fs
                    .readFileSync(this.getWSDLPath('device', 'capabilities.wsdl'))
                    .toString();
                query = query.replace('__DEVICE_SERVICE__', this.getXaddr(ip, 'device_service'));
                query = query.replace('__MEDIA_SERVICE__', this.getXaddr(ip, 'media_service'));
                query = query.replace('__EVENTS_SERVICE__', this.getXaddr(ip, 'events_service'));
                query = query.replace('__PTZ_SERVICE__', this.getXaddr(ip, 'ptz_service'));
                query = query.replace('__DEVICE_IO_SERVICE__', this.getXaddr(ip, 'deviceio_service'));
                http_logger_1.default.info(`[ONVIF] responseCapabilities: ${query}`);
                resolve(Buffer.from(query, 'utf-8'));
            }
            catch (error) {
                http_logger_1.default.error(`[ONVIF] responseCapabilities : ${(0, error_util_1.errorToJson)(error)}`);
                reject();
            }
        });
    }
    async responseDeviceInformation() {
        return new Promise(async (resolve, reject) => {
            try {
                await this.getVariables();
                let query = fs
                    .readFileSync(this.getWSDLPath('device', 'deviceinformation.wsdl'))
                    .toString();
                query = query.replace('__MANUFACTURER__', global.robotManufacturer || 'RainbowRobotics');
                query = query.replace('__MODEL__', global.robotModel || '');
                query = query.replace('__FIRMWARE__VERSION__', global.robotVersion || '1.0.0');
                query = query.replace('__SERIAL_NUMBER__', global.robotSerial || '');
                query = query.replace('__HARDWARE_ID__', global.robotHardware || '');
                http_logger_1.default.debug(`[ONVIF] responseDeviceInformation: ${query}`);
                resolve(Buffer.from(query, 'utf-8'));
            }
            catch (error) {
                http_logger_1.default.error(`[ONVIF] responseDeviceInformation : ${(0, error_util_1.errorToJson)(error)}`);
                reject();
            }
        });
    }
    getScopeQuery(scope) {
        return `<tds:Scopes>
      <tt:ScopeItem>${scope}</tt:ScopeItem>
    </tds:Scopes>`;
    }
    async responseScopes() {
        return new Promise(async (resolve, reject) => {
            try {
                await this.getVariables();
                let query = fs
                    .readFileSync(this.getWSDLPath('device', 'scopes.wsdl'))
                    .toString();
                let scopes_query = '';
                scopes_query += this.getScopeQuery('onvif://onvif://www.onvif.org/Profile/Streaming');
                scopes_query += this.getScopeQuery('onvif://www.onvif.org/location/country/Korea');
                scopes_query += this.getScopeQuery('onvif://www.onvif.org/name/' + global.robotSerial);
                scopes_query += this.getScopeQuery('onvif://www.onvif.org/type/video_encoder');
                scopes_query += this.getScopeQuery('onvif://www.onvif.org/type/ptz');
                scopes_query += this.getScopeQuery('onvif://www.onvif.org/type/Network_Video_Transmitter');
                query = query.replace('__SCOPES__', scopes_query);
                http_logger_1.default.debug(`[ONVIF] responseScopes: ${query}`);
                resolve(Buffer.from(query, 'utf-8'));
            }
            catch (error) {
                http_logger_1.default.error(`[ONVIF] responseScopes : ${(0, error_util_1.errorToJson)(error)}`);
                reject();
            }
        });
    }
    async responseNetworkInterfaces(_ip) {
        return new Promise(async (resolve, reject) => {
            try {
                let query = fs
                    .readFileSync(this.getWSDLPath('device', 'network/networkinterfaces.wsdl'))
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
                http_logger_1.default.info(`[ONVIF] responseNetworkInterfaces: ${query}`);
                resolve(Buffer.from(query, 'utf-8'));
            }
            catch (error) {
                http_logger_1.default.error(`[ONVIF] responseNetworkInterfaces : ${(0, error_util_1.errorToJson)(error)}`);
                reject();
            }
        });
    }
    async responseDNS(_ip) {
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
                http_logger_1.default.debug(`[ONVIF] responseDNS: ${query}`);
                console.log(query);
                resolve(Buffer.from(query, 'utf-8'));
            }
            catch (error) {
                http_logger_1.default.error(`[ONVIF] responseDNS : ${(0, error_util_1.errorToJson)(error)}`);
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
            }
            catch (error) {
                http_logger_1.default.error(`[ONVIF] responseNTP : ${(0, error_util_1.errorToJson)(error)}`);
                reject();
            }
        });
    }
    getActiveConnections() {
        try {
            const buffer = (0, child_process_1.execSync)('nmcli connection show --active');
            const result = buffer.toString();
            const connections = [];
            result.split('\n').map((line) => {
                if (!line.startsWith('NAME ') && line != '') {
                    connections.push(line.split('  ')[0]);
                }
            });
            return connections;
        }
        catch (error) {
            console.error(`명령어 실행 중 오류 발생: ${error.message}`);
            return [];
        }
    }
    getConnection(_ip) {
        try {
            if (_ip.includes('::ffff:')) {
                _ip = _ip.split('::ffff:')[1];
            }
            const connections = this.getActiveConnections();
            for (let i = 0; i < connections.length; i++) {
                const data = (0, child_process_1.execSync)(`nmcli connection show '${connections[i]}'`).toString();
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
                    }
                    else if (line.startsWith('IP4.ADDRESS')) {
                        const address = line.split(' ')[line.split(' ').length - 1];
                        info.address = address.split('/')[0];
                        info.subnet = address.split('/')[1];
                    }
                    else if (line.startsWith('ipv4.method')) {
                        if (line.includes('auto')) {
                            info.dhcp = true;
                        }
                        else {
                            info.dhcp = false;
                        }
                    }
                    else if (line.startsWith('IP4.DNS')) {
                        info.dns.push(line.split(' ')[line.split(' ').length - 1]);
                    }
                    else if (line.startsWith('GENERAL.DEVICE')) {
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
                if (_ip.startsWith(info.address.substring(0, info.address.lastIndexOf('.')))) {
                    return info;
                }
            }
            return null;
        }
        catch (error) {
            console.error(`명령어 실행 중 오류 발생: ${error.message}`);
            return null;
        }
    }
    async responseDefaultGateway(_ip) {
        return new Promise(async (resolve, reject) => {
            try {
                let query = fs
                    .readFileSync(this.getWSDLPath('device', 'network/defaultgateway.wsdl'))
                    .toString();
                const connection = this.getConnection(_ip);
                if (connection) {
                    query = query.replace('__GATEWAY__', connection.gateway);
                }
                http_logger_1.default.debug(`[ONVIF] responseDefaultGateway : ${query}`);
                resolve(Buffer.from(query, 'utf-8'));
            }
            catch (error) {
                http_logger_1.default.error(`[ONVIF] responseDefaultGateway : ${(0, error_util_1.errorToJson)(error)}`);
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
            }
            catch (error) {
                http_logger_1.default.error(`[ONVIF] responseDiscoveryMode : ${(0, error_util_1.errorToJson)(error)}`);
                reject();
            }
        });
    }
    async responseNetworkProtocols() {
        return new Promise(async (resolve, reject) => {
            try {
                const query = fs
                    .readFileSync(this.getWSDLPath('device', 'network/networkprotocols.wsdl'))
                    .toString();
                console.log(query);
                resolve(Buffer.from(query, 'utf-8'));
            }
            catch (error) {
                http_logger_1.default.error(`[ONVIF] responseNetworkProtocols : ${(0, error_util_1.errorToJson)(error)}`);
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
            }
            catch (error) {
                http_logger_1.default.error(`[ONVIF] responseDNS : ${(0, error_util_1.errorToJson)(error)}`);
                reject();
            }
        });
    }
    async responseServices(_ip) {
        return new Promise(async (resolve, reject) => {
            try {
                let query = fs
                    .readFileSync(this.getWSDLPath('device', 'services.wsdl'))
                    .toString();
                const ip = this.getLocalIp(_ip).address;
                query = query.replace('__DEVICE_SERVICE__', this.getXaddr(ip, 'device_service'));
                query = query.replace('__MEDIA_SERVICE__', this.getXaddr(ip, 'media_service'));
                query = query.replace('__PTZ_SERVICE__', this.getXaddr(ip, 'ptz_service'));
                console.log(query);
                resolve(Buffer.from(query, 'utf-8'));
            }
            catch (error) {
                http_logger_1.default.error(`[ONVIF] responseServices : ${(0, error_util_1.errorToJson)(error)}`);
                reject();
            }
        });
    }
    async responseMediaProfiles() {
        return new Promise(async (resolve, reject) => {
            try {
                const query = fs
                    .readFileSync(this.getWSDLPath('media', 'profiles.wsdl'))
                    .toString();
                console.log(query);
                resolve(Buffer.from(query, 'utf-8'));
            }
            catch (error) {
                http_logger_1.default.error(`[ONVIF] responseMediaProfiles : ${(0, error_util_1.errorToJson)(error)}`);
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
            }
            catch (error) {
                http_logger_1.default.error(`[ONVIF] responseMediaProfile : ${(0, error_util_1.errorToJson)(error)}`);
                reject();
            }
        });
    }
    async responseVideoSourceConfiguration() {
        return new Promise(async (resolve, reject) => {
            try {
                const query = fs
                    .readFileSync(this.getWSDLPath('media', 'videosourceconfiguration.wsdl'))
                    .toString();
                console.log(query);
                resolve(Buffer.from(query, 'utf-8'));
            }
            catch (error) {
                http_logger_1.default.error(`[ONVIF] responseVideoSourceConfiguration : ${(0, error_util_1.errorToJson)(error)}`);
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
            }
            catch (error) {
                http_logger_1.default.error(`[ONVIF] responseVideoSources : ${(0, error_util_1.errorToJson)(error)}`);
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
            }
            catch (error) {
                http_logger_1.default.error(`[ONVIF] responseAudioSources : ${(0, error_util_1.errorToJson)(error)}`);
                reject();
            }
        });
    }
    async responseSnapshotUri(_ip) {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.socketGateway.streaming) {
                    this.socketGateway.streaming.emit('snapshot');
                }
                const ip = this.getLocalIp(_ip).address;
                let query = fs
                    .readFileSync(this.getWSDLPath('media', 'snapshoturi.wsdl'))
                    .toString();
                query = query.replace('__SNAPSHOT_URI__', this.getXaddr(ip, 'snapshot.jpg'));
                console.log(query);
                resolve(Buffer.from(query, 'utf-8'));
            }
            catch (error) {
                http_logger_1.default.error(`[ONVIF] responseSnapshotUri : ${(0, error_util_1.errorToJson)(error)}`);
                reject();
            }
        });
    }
    async responseStreamUri(_ip) {
        return new Promise(async (resolve, reject) => {
            try {
                let query = fs
                    .readFileSync(this.getWSDLPath('media', 'streamuri.wsdl'))
                    .toString();
                const ip = this.getLocalIp(_ip).address;
                query = query.replace('__RTSP_URI__', this.getStream(ip, 'cam0'));
                console.log(query);
                resolve(Buffer.from(query, 'utf-8'));
            }
            catch (error) {
                http_logger_1.default.error(`[ONVIF] responseStreamUri : ${(0, error_util_1.errorToJson)(error)}`);
                reject();
            }
        });
    }
    async responsePTZMove(title) {
        return new Promise(async (resolve, reject) => {
            try {
                let query = fs
                    .readFileSync(this.getWSDLPath('ptz', 'move.wsdl'))
                    .toString();
                query = query.replace('__RESPONSE_TITLE__', title);
                resolve(Buffer.from(query, 'utf-8'));
            }
            catch (error) {
                http_logger_1.default.error(`[ONVIF] responsePTZContinousMove : ${(0, error_util_1.errorToJson)(error)}`);
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
            }
            catch (error) {
                http_logger_1.default.error(`[ONVIF] responseSetPreset : ${(0, error_util_1.errorToJson)(error)}`);
                reject();
            }
        });
    }
};
exports.OnvifDeviceService = OnvifDeviceService;
exports.OnvifDeviceService = OnvifDeviceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sockets_gateway_1.SocketGateway,
        variables_service_1.VariablesService])
], OnvifDeviceService);
//# sourceMappingURL=onvif.service.js.map