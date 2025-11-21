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
exports.MdnsResponder = void 0;
const common_1 = require("@nestjs/common");
const variables_service_1 = require("../modules/apis/variables/variables.service");
const network_service_1 = require("../modules/apis/network/network.service");
const mdns = require("multicast-dns");
const os = require("node:os");
const crypto = require("node:crypto");
let MdnsResponder = class MdnsResponder {
    constructor(variablesService, networkService) {
        this.variablesService = variablesService;
        this.networkService = networkService;
        this.mdns = mdns({
            multicast: true,
            interface: '0.0.0.0',
            port: 5353,
            ttl: 255,
        });
        this.serviceType = '_rainbow-robot._tcp.local';
        this.ttl = 4500;
        this.instanceId = '';
        this.instanceName = '';
        this.instanceFqdn = '';
        this.targetHost = '';
        this.servicePort = Number(process.env.ROBOT_API_PORT ?? 8180);
        this.announced = false;
    }
    async onModuleInit() {
        this.instanceId = await this.getInstanceId();
        this.instanceName = `rainbowbot-${this.instanceId}`;
        this.instanceFqdn = `${this.instanceName}.${this.serviceType}`;
        this.targetHost = `${this.instanceName}.local`;
        console.log(`[mDNS] 서비스 초기화 시작`);
        console.log(`[mDNS] 서비스 타입: ${this.serviceType}`);
        console.log(`[mDNS] 인스턴스 ID: ${this.instanceId}`);
        console.log(`[mDNS] 인스턴스 이름: ${this.instanceName}`);
        console.log(`[mDNS] 인스턴스 FQDN: ${this.instanceFqdn}`);
        console.log(`[mDNS] 타겟 호스트: ${this.targetHost}`);
        console.log(`[mDNS] 서비스 포트: ${this.servicePort}`);
        console.log(`[mDNS] 멀티캐스트 설정: interface=0.0.0.0, port=5353, ttl=255`);
        this.mdns.on('query', (packet) => {
            const questions = packet.questions?.map((q) => `${q.name} (${q.type})`) || [];
            console.log(`[mDNS] 쿼리 수신:`, questions);
            if (packet.questions) {
                for (const q of packet.questions) {
                    console.log(`[mDNS] 쿼리 상세: ${q.name} (${q.type}) - class: ${q.class}`);
                }
            }
            const wants = this.wants(packet);
            if (!wants) {
                console.log(`[mDNS] 쿼리가 우리 서비스와 관련 없음, 무시`);
                console.log(`[mDNS] 우리 서비스: ${this.serviceType}, 인스턴스: ${this.instanceFqdn}, 타겟: ${this.targetHost}`);
                return;
            }
            console.log(`[mDNS] 관련 쿼리 감지, 응답 전송`);
            this.respondAll();
        });
        setTimeout(async () => {
            console.log(`[mDNS] 자발 광고 시작`);
            const success = await this.respondAll();
            if (success) {
                this.announced = true;
                console.log(`[mDNS] 자발 광고 완료`);
            }
            else {
                console.error(`[mDNS] 자발 광고 실패, 서비스 시작되지 않음`);
            }
            setInterval(async () => {
                console.log(`[mDNS] 주기적 광고 (${Math.round(this.ttl * 0.8)}초마다)`);
                await this.respondAll();
            }, this.ttl * 0.8 * 1000);
        }, 100);
        setTimeout(async () => {
            if (this.announced) {
                console.log(`[mDNS] 초기 안정화 광고 (5초 후)`);
                await this.respondAll();
            }
        }, 5000);
        this.ipCheckTimer = setInterval(async () => {
            if (this.announced) {
                await this.checkIpChange();
            }
        }, 5000);
    }
    async onModuleDestroy() {
        if (this.announced) {
            this.mdns.respond({
                answers: [
                    {
                        name: this.serviceType,
                        type: 'PTR',
                        ttl: 0,
                        data: this.instanceFqdn,
                    },
                    {
                        name: this.instanceFqdn,
                        type: 'SRV',
                        ttl: 0,
                        data: {
                            priority: 0,
                            weight: 0,
                            port: this.servicePort,
                            target: this.targetHost,
                        },
                    },
                    {
                        name: this.instanceFqdn,
                        type: 'TXT',
                        ttl: 0,
                        data: await this.buildTxtArray(),
                    },
                ],
            });
        }
        if (this.ipCheckTimer) {
            clearInterval(this.ipCheckTimer);
            this.ipCheckTimer = undefined;
        }
        this.mdns.destroy();
    }
    isPtrOrAny(q) {
        const t = String(q.type).toUpperCase();
        return t === 'PTR' || t === 'ANY';
    }
    isSrvTxtOrAny(q) {
        const t = String(q.type).toUpperCase();
        return t === 'SRV' || t === 'TXT' || t === 'ANY';
    }
    isAaaaOrAny(q) {
        const t = String(q.type).toUpperCase();
        return t === 'A' || t === 'AAAA' || t === 'ANY';
    }
    isStringAnswer(answer) {
        return answer.type === 'A' || answer.type === 'AAAA';
    }
    wantsThisQuestion(q) {
        const qname = q.name.toLowerCase();
        const serviceType = this.serviceType.toLowerCase();
        const instanceFqdn = this.instanceFqdn.toLowerCase();
        const targetHost = this.targetHost.toLowerCase();
        if (qname === '_services._dns-sd._udp.local' && this.isPtrOrAny(q)) {
            return true;
        }
        if (qname === serviceType && this.isPtrOrAny(q)) {
            return true;
        }
        if (qname === instanceFqdn && this.isSrvTxtOrAny(q)) {
            return true;
        }
        if (qname === targetHost && this.isAaaaOrAny(q)) {
            return true;
        }
        return false;
    }
    wants(packet) {
        return packet.questions?.some((q) => this.wantsThisQuestion(q)) ?? false;
    }
    async respondAll() {
        console.log(`[mDNS] 응답 생성 시작`);
        try {
            const addressRecord = await this.buildAddressRecord();
            const answers = await this.buildAnswers(addressRecord);
            this.mdns.respond({ answers });
            console.log(`[mDNS] 응답 전송 완료 - 레코드 수: ${answers.length}`);
            answers.forEach((record, index) => {
                const hasData = record.data !== undefined;
                const dataStr = hasData
                    ? JSON.stringify(record.data)
                    : '(no data)';
                console.log(`[mDNS] 레코드 ${index + 1}: ${record.name} (${record.type}) -> ${dataStr}`);
            });
            return true;
        }
        catch (error) {
            console.error(`[mDNS] 응답 생성 또는 전송 실패:`, error);
            return false;
        }
    }
    async buildAnswers(addressRecord) {
        const txtData = await this.buildTxtArray();
        const answers = [
            {
                name: this.serviceType,
                type: 'PTR',
                ttl: this.ttl,
                data: this.instanceFqdn,
            },
            {
                name: this.instanceFqdn,
                type: 'SRV',
                ttl: this.ttl,
                data: {
                    priority: 0,
                    weight: 0,
                    port: this.servicePort,
                    target: this.targetHost,
                },
            },
            {
                name: this.instanceFqdn,
                type: 'TXT',
                ttl: this.ttl,
                data: txtData,
            },
            addressRecord,
        ];
        console.log(`[mDNS] PTR 레코드: ${this.serviceType} -> ${this.instanceFqdn}`);
        console.log(`[mDNS] SRV 레코드: ${this.instanceFqdn} -> ${this.targetHost}:${this.servicePort}`);
        console.log(`[mDNS] TXT 레코드: ${this.instanceFqdn} -> ${txtData.join(',')}`);
        if (this.isStringAnswer(addressRecord)) {
            console.log(`[mDNS] A/AAAA 레코드: ${addressRecord.name} (${addressRecord.type}) -> ${addressRecord.data}`);
        }
        return answers;
    }
    async buildAddressRecord() {
        const wifiIp = await this.getCurrentWifiIp();
        if (!wifiIp) {
            throw new Error('[mDNS] Wi-Fi IP를 확인하지 못했습니다. Wi-Fi에 연결되어 할당받은 IP가 없으면 mDNS 응답을 생성할 수 없습니다.');
        }
        const recordType = wifiIp.includes(':') ? 'AAAA' : 'A';
        const record = {
            name: this.targetHost,
            type: recordType,
            ttl: this.ttl,
            data: wifiIp,
        };
        console.log(`[mDNS] 현재 Wi-Fi IP(${wifiIp}) 기반 ${recordType} 레코드를 생성했습니다.`);
        return record;
    }
    async getCurrentWifiIp() {
        try {
            const [networkState, wifiConnections] = await Promise.all([
                this.networkService.getNetwork(),
                this.networkService.getCurrentWifi(),
            ]);
            const networkInfo = networkState;
            const wifiInterfaces = Array.isArray(networkInfo?.wifi)
                ? networkInfo.wifi
                : [];
            if (!wifiInterfaces.length) {
                console.log('[mDNS] 네트워크 서비스에서 Wi-Fi 정보를 찾지 못했습니다.');
                return undefined;
            }
            if (wifiConnections?.length) {
                const matched = this.findMatchingWifiInterface(wifiInterfaces, wifiConnections);
                if (matched?.ip) {
                    console.log(`[mDNS] 현재 연결된 Wi-Fi IP 확인: ${matched.ip}`);
                    return matched.ip;
                }
            }
            const fallback = wifiInterfaces.find((wifi) => wifi.ip)?.ip;
            if (fallback) {
                console.log(`[mDNS] Wi-Fi 매칭 실패, 첫 번째 Wi-Fi IP(${fallback})를 사용합니다.`);
            }
            else {
                console.log('[mDNS] Wi-Fi IP 정보를 찾지 못했습니다.');
            }
            return fallback;
        }
        catch (error) {
            console.error('[mDNS] Wi-Fi IP 조회 중 오류 발생:', error);
            return undefined;
        }
    }
    findMatchingWifiInterface(wifiInterfaces, connections) {
        for (const connection of connections) {
            const iface = connection?.iface?.toString().toLowerCase();
            const ssid = connection?.ssid?.toString().toLowerCase();
            const bssid = connection?.bssid ?? connection?.mac;
            const normalizedBssid = typeof bssid === 'string'
                ? bssid.replace(/:/g, '').toLowerCase()
                : undefined;
            const matched = wifiInterfaces.find((wifi) => {
                if (!wifi)
                    return false;
                const matchByDevice = iface && wifi.device?.toLowerCase() === iface && wifi.ip;
                const matchByName = ssid && wifi.name?.toLowerCase() === ssid && wifi.ip;
                const wifiHwAddr = wifi.hwAddr
                    ? wifi.hwAddr.replace(/:/g, '').toLowerCase()
                    : undefined;
                const matchByHwAddr = normalizedBssid && wifiHwAddr === normalizedBssid && wifi.ip;
                return matchByDevice || matchByName || matchByHwAddr;
            });
            if (matched) {
                return matched;
            }
        }
        return undefined;
    }
    async buildTxtArray() {
        const model = (await this.variablesService.getVariable('robotType')) ?? 'S100';
        const id = process.env.ROBOT_ID ?? this.instanceId;
        return [`model=${model}`, `robot_serial=${id}`, `api_mode=legacy`];
    }
    async checkIpChange() {
        try {
            const currentRecord = await this.buildAddressRecord();
            if (!this.isStringAnswer(currentRecord)) {
                return;
            }
            const currentPrimaryIp = currentRecord.data;
            if (!this.lastPrimaryIp) {
                this.lastPrimaryIp = currentPrimaryIp;
                console.log(`[mDNS] IP 변경 체크: 초기 IP 설정 - ${currentPrimaryIp}`);
                return;
            }
            if (this.lastPrimaryIp !== currentPrimaryIp) {
                console.log(`[mDNS] IP 변경 감지: ${this.lastPrimaryIp} -> ${currentPrimaryIp}`);
                this.sendByeForIp(this.lastPrimaryIp);
                await this.respondAll();
                this.lastPrimaryIp = currentPrimaryIp;
            }
        }
        catch (error) {
            console.error(`[mDNS] IP 변경 체크 실패:`, error);
        }
    }
    sendByeForIp(ip) {
        try {
            const recordType = ip.includes(':') ? 'AAAA' : 'A';
            this.mdns.respond({
                answers: [
                    {
                        name: this.targetHost,
                        type: recordType,
                        ttl: 0,
                        data: ip,
                    },
                ],
            });
            console.log(`[mDNS] 기존 IP bye 응답 전송: ${ip} (${recordType})`);
        }
        catch (error) {
            console.error(`[mDNS] bye 응답 전송 실패:`, error);
        }
    }
    async getInstanceId() {
        if (process.env.ROBOT_ID) {
            return process.env.ROBOT_ID;
        }
        if (global.robotSerial) {
            return global.robotSerial;
        }
        try {
            const robotSerial = await this.getRobotSerialFromDB();
            if (robotSerial)
                return robotSerial;
        }
        catch (error) {
            console.warn('[mDNS] DB에서 robotSerial 조회 실패:', error);
        }
        const host = os.hostname() || 'unknown-host';
        return `rb-${crypto.createHash('sha1').update(host).digest('hex').slice(0, 6)}`;
    }
    async getRobotSerialFromDB() {
        try {
            const serial = await this.variablesService.getVariable('robotSerial');
            return serial && serial.trim() !== '' ? serial : null;
        }
        catch (error) {
            console.warn('[mDNS] VariablesService.getVariable("robotSerial") 실패:', error);
            return null;
        }
    }
};
exports.MdnsResponder = MdnsResponder;
exports.MdnsResponder = MdnsResponder = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [variables_service_1.VariablesService,
        network_service_1.NetworkService])
], MdnsResponder);
//# sourceMappingURL=mdns.responder.js.map