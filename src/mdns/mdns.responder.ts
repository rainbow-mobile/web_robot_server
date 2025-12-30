import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { VariablesService } from '../modules/apis/variables/variables.service';
import { NetworkService } from '../modules/apis/network/network.service';
import * as mdns from 'multicast-dns';
import type { Answer, Question, StringAnswer } from 'dns-packet';
import { NetworkPayload } from '@common/interface/network/network.interface';

// dns-packet의 Answer 타입을 사용하여 응답 레코드를 엄격 타이핑합니다.

@Injectable()
export class MdnsResponder implements OnModuleInit, OnModuleDestroy {
  private mdns = mdns({
    multicast: true,
    interface: '0.0.0.0', // 모든 인터페이스에서 수신
    port: 5353,
    ttl: 255,
  }); // UDP 5353 멀티캐스트 join
  private readonly serviceType = '_rainbow-robot._tcp.local';
  private readonly ttl = 4500; // 75분 (표준 mDNS TTL)

  private instanceId: string = ''; // 고유 식별자 (비동기 초기화)
  private instanceName: string = '';
  private instanceFqdn: string = '';
  private targetHost: string = '';
  private readonly servicePort = Number(process.env.ROBOT_API_PORT ?? 8180);

  private announced = false;
  private lastPrimaryIp?: string;
  private ipCheckTimer?: NodeJS.Timeout;

  constructor(
    private readonly variablesService: VariablesService,
    private readonly networkService: NetworkService,
  ) {}

  async onModuleInit() {
    // 비동기로 인스턴스 ID 초기화
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
    console.log(
      `[mDNS] 멀티캐스트 설정: interface=0.0.0.0, port=5353, ttl=255`,
    );

    // 쿼리 수신 시 응답
    this.mdns.on('query', (packet) => {
      const questions =
        packet.questions?.map((q) => `${q.name} (${q.type})`) || [];
      console.log(`[mDNS] 쿼리 수신:`, questions);

      // 쿼리 상세 정보 로깅
      if (packet.questions) {
        for (const q of packet.questions) {
          console.log(
            `[mDNS] 쿼리 상세: ${q.name} (${q.type}) - class: ${q.class}`,
          );
        }
      }

      // 쿼리가 우리 서비스와 관련된 경우 응답 여부 확인
      // 1) 서비스 열거 쿼리 (_services._dns-sd._udp.local)
      // 2) 서비스 타입 쿼리 (_rainbow-robot._tcp.local, PTR/ANY)
      // 3) 인스턴스 쿼리 (SRV/TXT/ANY)
      // 4) 호스트 쿼리 (A/AAAA/ANY)
      const wants = this.wants(packet);

      if (!wants) {
        console.log(`[mDNS] 쿼리가 우리 서비스와 관련 없음, 무시`);
        console.log(
          `[mDNS] 우리 서비스: ${this.serviceType}, 인스턴스: ${this.instanceFqdn}, 타겟: ${this.targetHost}`,
        );
        return;
      }

      console.log(`[mDNS] 관련 쿼리 감지, 응답 전송`);
      this.respondAll();
    });

    // 부팅 직후 **자발 광고(unsolicited announcement)** 를 한 번 날려주면
    // 당신의 스캐너가 즉시 발견 가능 (쿼리 기다리지 않음)
    setTimeout(async () => {
      console.log(`[mDNS] 자발 광고 시작`);
      const success = await this.respondAll();
      if (success) {
        this.announced = true;
        console.log(`[mDNS] 자발 광고 완료`);
      } else {
        console.error(`[mDNS] 자발 광고 실패, 서비스 시작되지 않음`);
        // announced는 false로 유지되어 초기 안정화 광고와 IP 변경 체크가 실행되지 않음
      }

      // 운영환경: TTL의 80% 주기로 주기적 광고 (표준 mDNS 방식)
      setInterval(
        async () => {
          console.log(
            `[mDNS] 주기적 광고 (${Math.round(this.ttl * 0.8)}초마다)`,
          );
          await this.respondAll();
        },
        this.ttl * 0.8 * 1000,
      ); // TTL의 80% = 3600초 (1시간)마다
    }, 100);

    // 운영환경: 초기 안정화를 위해 5초 후 추가 광고
    setTimeout(async () => {
      if (this.announced) {
        console.log(`[mDNS] 초기 안정화 광고 (5초 후)`);
        await this.respondAll();
      }
    }, 5000);

    // IP 변경 감지 타이머 (5초마다 체크)
    this.ipCheckTimer = setInterval(async () => {
      if (this.announced) {
        await this.checkIpChange();
      }
    }, 5000);
  }

  async onModuleDestroy() {
    // 서비스 종료 시 "goodbye(bye)" 알림(선택)
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
          // A/AAAA도 ttl 0으로 내려도 되지만, 보통 PTR/SRV/TXT만 bye로 충분
        ],
      });
    }

    // IP 체크 타이머 정리
    if (this.ipCheckTimer) {
      clearInterval(this.ipCheckTimer);
      this.ipCheckTimer = undefined;
    }

    this.mdns.destroy();
  }

  private isPtrOrAny(q: Question): boolean {
    const t = String(q.type).toUpperCase();
    return t === 'PTR' || t === 'ANY';
  }

  private isSrvTxtOrAny(q: Question): boolean {
    const t = String(q.type).toUpperCase();
    return t === 'SRV' || t === 'TXT' || t === 'ANY';
  }

  private isAaaaOrAny(q: Question): boolean {
    const t = String(q.type).toUpperCase();
    return t === 'A' || t === 'AAAA' || t === 'ANY';
  }

  private isStringAnswer(answer: Answer): answer is StringAnswer {
    return answer.type === 'A' || answer.type === 'AAAA';
  }

  private wantsThisQuestion(q: Question): boolean {
    const qname = q.name.toLowerCase();
    const serviceType = this.serviceType.toLowerCase();
    const instanceFqdn = this.instanceFqdn.toLowerCase();
    const targetHost = this.targetHost.toLowerCase();

    // 1) 서비스 열거(_services._dns-sd._udp.local) → 내 서비스 타입 PTR 응답
    if (qname === '_services._dns-sd._udp.local' && this.isPtrOrAny(q)) {
      return true;
    }

    // 2) 내 서비스 타입 쿼리(_rainbow-robot._tcp.local) → 내 인스턴스 PTR 응답
    if (qname === serviceType && this.isPtrOrAny(q)) {
      return true;
    }

    // 3) 내 인스턴스 쿼리(SRV/TXT)
    if (qname === instanceFqdn && this.isSrvTxtOrAny(q)) {
      return true;
    }

    // 4) 내 호스트 쿼리(A/AAAA)
    if (qname === targetHost && this.isAaaaOrAny(q)) {
      return true;
    }

    return false;
  }

  private wants(packet: { questions?: Question[] }): boolean {
    return packet.questions?.some((q) => this.wantsThisQuestion(q)) ?? false;
  }

  private async respondAll(): Promise<boolean> {
    console.log(`[mDNS] 응답 생성 시작`);

    try {
      const addressRecord = await this.buildAddressRecord();
      const answers = await this.buildAnswers(addressRecord);

      // mDNS 표준에 따라 모든 레코드를 answers에 포함
      this.mdns.respond({ answers });
      console.log(`[mDNS] 응답 전송 완료 - 레코드 수: ${answers.length}`);

      // 전송된 레코드 상세 정보 로깅
      answers.forEach((record, index) => {
        const hasData = (record as any).data !== undefined;
        const dataStr = hasData
          ? JSON.stringify((record as any).data)
          : '(no data)';
        console.log(
          `[mDNS] 레코드 ${index + 1}: ${record.name} (${record.type}) -> ${dataStr}`,
        );
      });

      return true;
    } catch (error) {
      console.error(`[mDNS] 응답 생성 또는 전송 실패:`, error);
      // 에러를 내부에서 처리 (주기적 광고 등에서 계속 시도할 수 있도록)
      // mDNS 응답 실패는 치명적이지 않으며, 다음 주기나 다음 쿼리에서 재시도 가능
      return false;
    }
  }

  private async buildAnswers(addressRecord: Answer): Promise<Answer[]> {
    const txtData = await this.buildTxtArray();

    // 모든 레코드를 answers에 포함 (mDNS 표준에 따라)
    const answers: Answer[] = [
      // 1) PTR: 타입 목록 → 인스턴스 FQDN
      {
        name: this.serviceType,
        type: 'PTR',
        ttl: this.ttl,
        data: this.instanceFqdn,
      },
      // 2) SRV: 인스턴스 FQDN → target/port
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
      // 3) TXT: 문자열 한 덩어리 (클라 파서와 호환)
      {
        name: this.instanceFqdn,
        type: 'TXT',
        ttl: this.ttl,
        // multicast-dns/dns-packet은 TXT를 string[] | Buffer[]로 기대
        data: txtData,
      },
      // 4) A/AAAA: SRV target 이름과 정확히 일치하는 A/AAAA
      addressRecord,
    ];

    console.log(
      `[mDNS] PTR 레코드: ${this.serviceType} -> ${this.instanceFqdn}`,
    );
    console.log(
      `[mDNS] SRV 레코드: ${this.instanceFqdn} -> ${this.targetHost}:${this.servicePort}`,
    );
    console.log(
      `[mDNS] TXT 레코드: ${this.instanceFqdn} -> ${txtData.join(',')}`,
    );
    if (this.isStringAnswer(addressRecord)) {
      console.log(
        `[mDNS] A/AAAA 레코드: ${addressRecord.name} (${addressRecord.type}) -> ${addressRecord.data}`,
      );
    }

    return answers;
  }

  private async buildAddressRecord(): Promise<Answer> {
    const wifiIp = await this.getCurrentWifiIp();

    if (!wifiIp) {
      throw new Error(
        '[mDNS] Wi-Fi IP를 확인하지 못했습니다. Wi-Fi에 연결되어 할당받은 IP가 없으면 mDNS 응답을 생성할 수 없습니다.',
      );
    }

    const recordType = wifiIp.includes(':') ? 'AAAA' : 'A';
    const record: Answer = {
      name: this.targetHost,
      type: recordType,
      ttl: this.ttl,
      data: wifiIp,
    };

    console.log(
      `[mDNS] 현재 Wi-Fi IP(${wifiIp}) 기반 ${recordType} 레코드를 생성했습니다.`,
    );

    return record;
  }

  private async getCurrentWifiIp(): Promise<string | undefined> {
    try {
      const [networkState, wifiConnections] = await Promise.all([
        this.networkService.getNetwork(),
        this.networkService.getCurrentWifi(),
      ]);

      const networkInfo = networkState as { wifi?: NetworkPayload[] } | null;

      const wifiInterfaces: NetworkPayload[] = Array.isArray(networkInfo?.wifi)
        ? networkInfo.wifi
        : [];

      if (!wifiInterfaces.length) {
        console.log('[mDNS] 네트워크 서비스에서 Wi-Fi 정보를 찾지 못했습니다.');
        return undefined;
      }

      if (wifiConnections?.length) {
        const matched = this.findMatchingWifiInterface(
          wifiInterfaces,
          wifiConnections,
        );
        if (matched?.ip) {
          console.log(`[mDNS] 현재 연결된 Wi-Fi IP 확인: ${matched.ip}`);
          return matched.ip;
        }
      }

      const fallback = wifiInterfaces.find((wifi) => wifi.ip)?.ip;
      if (fallback) {
        console.log(
          `[mDNS] Wi-Fi 매칭 실패, 첫 번째 Wi-Fi IP(${fallback})를 사용합니다.`,
        );
      } else {
        console.log('[mDNS] Wi-Fi IP 정보를 찾지 못했습니다.');
      }

      return fallback;
    } catch (error) {
      console.error('[mDNS] Wi-Fi IP 조회 중 오류 발생:', error);
      return undefined;
    }
  }

  private findMatchingWifiInterface(
    wifiInterfaces: NetworkPayload[],
    connections: any[],
  ): NetworkPayload | undefined {
    for (const connection of connections) {
      const iface = connection?.iface?.toString().toLowerCase();
      const ssid = connection?.ssid?.toString().toLowerCase();
      const bssid = connection?.bssid ?? connection?.mac;
      const normalizedBssid =
        typeof bssid === 'string'
          ? bssid.replace(/:/g, '').toLowerCase()
          : undefined;

      const matched = wifiInterfaces.find((wifi) => {
        if (!wifi) return false;

        const matchByDevice =
          iface && wifi.device?.toLowerCase() === iface && wifi.ip;
        const matchByName =
          ssid && wifi.name?.toLowerCase() === ssid && wifi.ip;

        const wifiHwAddr = wifi.hwAddr
          ? wifi.hwAddr.replace(/:/g, '').toLowerCase()
          : undefined;
        const matchByHwAddr =
          normalizedBssid && wifiHwAddr === normalizedBssid && wifi.ip;

        return matchByDevice || matchByName || matchByHwAddr;
      });

      if (matched) {
        return matched;
      }
    }

    return undefined;
  }

  private async buildTxtArray(): Promise<string[]> {
    // TXT는 key=value 항목의 배열로 제공 (대소문자: 키는 소문자 권장)
    const model =
      (await this.variablesService.getVariable('robotType')) ?? 'S100';
    const id = process.env.ROBOT_ID ?? this.instanceId;
    // TODO: msa버전에는 api_mode=msa 추가
    return [`model=${model}`, `robot_serial=${id}`, `api_mode=legacy`];
  }

  private async checkIpChange(): Promise<void> {
    try {
      const currentRecord = await this.buildAddressRecord();
      if (!this.isStringAnswer(currentRecord)) {
        return;
      }
      const currentPrimaryIp = currentRecord.data;

      // 첫 번째 체크이거나 IP가 변경된 경우
      if (!this.lastPrimaryIp) {
        this.lastPrimaryIp = currentPrimaryIp;
        console.log(`[mDNS] IP 변경 체크: 초기 IP 설정 - ${currentPrimaryIp}`);
        return;
      }

      if (this.lastPrimaryIp !== currentPrimaryIp) {
        console.log(
          `[mDNS] IP 변경 감지: ${this.lastPrimaryIp} -> ${currentPrimaryIp}`,
        );

        // 기존 IP에 대한 bye 응답 전송
        this.sendByeForIp(this.lastPrimaryIp);

        // 새 IP로 재광고
        await this.respondAll();

        // 마지막 IP 업데이트
        this.lastPrimaryIp = currentPrimaryIp;
      }
    } catch (error) {
      // Wi-Fi IP가 없으면 IP 변경 체크를 수행할 수 없음
      console.error(`[mDNS] IP 변경 체크 실패:`, error);
    }
  }

  private sendByeForIp(ip: string): void {
    try {
      const recordType = ip.includes(':') ? 'AAAA' : 'A';
      this.mdns.respond({
        answers: [
          {
            name: this.targetHost,
            type: recordType,
            ttl: 0, // bye 응답
            data: ip,
          },
        ],
      });
      console.log(`[mDNS] 기존 IP bye 응답 전송: ${ip} (${recordType})`);
    } catch (error) {
      console.error(`[mDNS] bye 응답 전송 실패:`, error);
    }
  }

  private async getInstanceId(): Promise<string> {
    try {
      const robotSerial = await this.getRobotSerialFromDB();
      if (robotSerial) {
        return robotSerial;
      }
    } catch (error) {
      console.warn('[mDNS] DB에서 robotSerial 조회 실패:', error);
    }
    return '';
  }

  private async getRobotSerialFromDB(): Promise<string | null> {
    try {
      const serial = await this.variablesService.getVariable('robotSerial');
      return serial && serial.trim() !== '' ? serial : null;
    } catch (error) {
      console.warn(
        '[mDNS] VariablesService.getVariable("robotSerial") 실패:',
        error,
      );
      return null;
    }
  }
}
