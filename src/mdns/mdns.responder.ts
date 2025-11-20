import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { VariablesService } from '../modules/apis/variables/variables.service';
import * as mdns from 'multicast-dns';
import type { Answer } from 'dns-packet';
import * as os from 'node:os';
import * as crypto from 'node:crypto';

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

  constructor(private readonly variablesService: VariablesService) {}

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

      // 클라가 우리 서비스 타입을 PTR/ANY로 물으면 응답 (대소문자 무시)
      const wants = packet.questions?.some((q) => {
        // 서비스 타입 쿼리
        if (
          q.name.toLowerCase() === this.serviceType.toLowerCase() &&
          (q.type.toUpperCase() === 'PTR' ||
            (q.type as string).toUpperCase() === 'ANY')
        ) {
          return true;
        }
        // 인스턴스 FQDN 쿼리
        if (
          q.name.toLowerCase() === this.instanceFqdn.toLowerCase() &&
          (q.type.toUpperCase() === 'SRV' ||
            q.type.toUpperCase() === 'TXT' ||
            (q.type as string).toUpperCase() === 'ANY')
        ) {
          return true;
        }
        // 타겟 호스트 쿼리
        if (
          q.name.toLowerCase() === this.targetHost.toLowerCase() &&
          (q.type.toUpperCase() === 'A' ||
            q.type.toUpperCase() === 'AAAA' ||
            (q.type as string).toUpperCase() === 'ANY')
        ) {
          return true;
        }
        // 와일드카드 쿼리 (모든 서비스 타입)
        if (
          q.name.toLowerCase() === '_services._dns-sd._udp.local' &&
          (q.type.toUpperCase() === 'PTR' ||
            (q.type as string).toUpperCase() === 'ANY')
        ) {
          return true;
        }
        return false;
      });

      if (!wants) {
        console.log(`[mDNS] 쿼리가 우리 서비스와 관련 없음, 무시`);
        console.log(
          `[mDNS] 우리 서비스: ${this.serviceType}, 인스턴스: ${this.instanceFqdn}, 타겟: ${this.targetHost}`,
        );
        return;
      }

      console.log(`[mDNS] 관련 쿼리 감지, 응답 전송`);
      this.respondAll().catch((error) => {
        console.error(`[mDNS] 응답 전송 실패:`, error);
      });
    });

    // 부팅 직후 **자발 광고(unsolicited announcement)** 를 한 번 날려주면
    // 당신의 스캐너가 즉시 발견 가능 (쿼리 기다리지 않음)
    setTimeout(async () => {
      console.log(`[mDNS] 자발 광고 시작`);
      await this.respondAll();
      this.announced = true;
      console.log(`[mDNS] 자발 광고 완료`);

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
    }, 100); // 500ms -> 100ms로 단축

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

  private async respondAll() {
    console.log(`[mDNS] 응답 생성 시작`);

    const addressRecords = this.buildAddressRecords();

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
        data: await this.buildTxtArray(),
      },
      // 4) A/AAAA: SRV target 이름과 정확히 일치하는 A/AAAA
      ...addressRecords,
    ];

    console.log(
      `[mDNS] PTR 레코드: ${this.serviceType} -> ${this.instanceFqdn}`,
    );
    console.log(
      `[mDNS] SRV 레코드: ${this.instanceFqdn} -> ${this.targetHost}:${this.servicePort}`,
    );
    const txtData = await this.buildTxtArray();
    console.log(
      `[mDNS] TXT 레코드: ${this.instanceFqdn} -> ${txtData.join(',')}`,
    );
    console.log(`[mDNS] A/AAAA 레코드 개수: ${addressRecords.length}`);

    // mDNS 표준에 따라 모든 레코드를 answers에 포함
    try {
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
    } catch (error) {
      console.error(`[mDNS] 응답 전송 실패:`, error);
    }
  }

  private buildAddressRecords(): Answer[] {
    // 가능한 로컬 IP들을 추출하여 A/AAAA를 만듭니다.
    const ifaces = os.networkInterfaces();
    const records: Answer[] = [];
    const interfacePriority = ['Wi-Fi', 'Ethernet', 'en0', 'eth0']; // Wi-Fi 우선순위

    console.log(`[mDNS] 네트워크 인터페이스 스캔 시작`);

    // 우선순위에 따라 인터페이스 정렬
    const sortedInterfaces = Object.keys(ifaces).sort((a, b) => {
      const aIndex = interfacePriority.findIndex((priority) =>
        a.includes(priority),
      );
      const bIndex = interfacePriority.findIndex((priority) =>
        b.includes(priority),
      );
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

    // 유효한 IP 주소를 수집 (우선순위별로)
    const validIps: { ip: string; interface: string; priority: number }[] = [];

    for (const name of sortedInterfaces) {
      console.log(`[mDNS] 인터페이스 ${name} 검사 중`);

      // 가상머신 인터페이스 필터링
      if (this.isVirtualMachineInterface(name)) {
        console.log(`[mDNS] 가상머신 인터페이스 건너뜀: ${name}`);
        continue;
      }

      for (const info of ifaces[name] ?? []) {
        if (!info || info.internal) {
          console.log(
            `[mDNS] 인터페이스 ${name}: ${info?.address} (내부/무효, 건너뜀)`,
          );
          continue;
        }

        if (info.family === 'IPv4' && info.address) {
          // Docker 네트워크 IP 필터링 (172.17.x.x, 172.18.x.x 등)
          if (this.isDockerNetworkIp(info.address)) {
            console.log(
              `[mDNS] Docker 네트워크 IP 건너뜀: ${info.address} (${name})`,
            );
            continue;
          }

          // 루프백 주소 필터링
          if (info.address.startsWith('127.')) {
            console.log(`[mDNS] 루프백 IP 건너뜀: ${info.address} (${name})`);
            continue;
          }

          // PDU 통신용 IP 필터링 (192.168.2.x 대역)
          if (this.isPduNetworkIp(info.address)) {
            console.log(
              `[mDNS] PDU 통신용 IP 건너뜀: ${info.address} (${name})`,
            );
            continue;
          }

          const priority = interfacePriority.findIndex((p) => name.includes(p));
          validIps.push({
            ip: info.address,
            interface: name,
            priority: priority === -1 ? 999 : priority,
          });
          console.log(
            `[mDNS] 유효한 IPv4 주소 발견: ${info.address} (${name})`,
          );
        } else if (info.family === 'IPv6' && info.address) {
          // 링크로컬(fe80::)은 보통 생략. 필요시 포함
          if (!info.address.startsWith('fe80:')) {
            const priority = interfacePriority.findIndex((p) =>
              name.includes(p),
            );
            validIps.push({
              ip: info.address,
              interface: name,
              priority: priority === -1 ? 999 : priority,
            });
            console.log(
              `[mDNS] 유효한 IPv6 주소 발견: ${info.address} (${name})`,
            );
          } else {
            console.log(
              `[mDNS] IPv6 링크로컬 주소 건너뜀: ${info.address} (${name})`,
            );
          }
        }
      }
    }

    // 우선순위에 따라 정렬하고 가장 높은 우선순위의 IP만 선택
    validIps.sort((a, b) => a.priority - b.priority);

    if (validIps.length > 0) {
      // 가장 높은 우선순위의 IP만 등록 (ping 문제 해결)
      const primaryIp = validIps[0];
      console.log(
        `[mDNS] 주요 IP 선택: ${primaryIp.ip} (${primaryIp.interface})`,
      );

      if (primaryIp.ip.includes(':')) {
        records.push({
          name: this.targetHost,
          type: 'AAAA',
          ttl: this.ttl,
          data: primaryIp.ip,
        });
      } else {
        records.push({
          name: this.targetHost,
          type: 'A',
          ttl: this.ttl,
          data: primaryIp.ip,
        });
      }

      // 추가 IP가 필요한 경우에만 더 추가 (일반적으로는 하나만)
      if (validIps.length > 1) {
        console.log(
          `[mDNS] 추가 IP 발견했지만 주요 IP만 등록: ${validIps.length - 1}개 건너뜀`,
        );
      }
    }

    // IP가 하나도 못 잡히는 극단 상황을 대비(옵션)
    if (records.length === 0) {
      console.log(`[mDNS] 경고: 사용 가능한 IP 주소가 없습니다!`);
    } else {
      console.log(`[mDNS] 총 ${records.length}개의 IP 주소 레코드 생성됨`);
    }

    return records;
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
    const currentRecords = this.buildAddressRecords();
    const currentPrimaryIp = (
      currentRecords.find((r) => r.type === 'A' || r.type === 'AAAA') as any
    )?.data as string | undefined;

    if (!currentPrimaryIp) {
      console.log(`[mDNS] IP 변경 체크: 현재 IP 없음`);
      return;
    }

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

  private isDockerNetworkIp(ip: string): boolean {
    // Docker 기본 네트워크 범위들 필터링
    const dockerRanges = [
      '172.17.', // Docker 기본 브리지 네트워크
      '172.18.',
      '172.19.',
      '172.20.',
      '172.21.',
      '172.22.',
      '172.23.',
      '172.24.',
      '172.25.',
      '172.26.',
      '172.27.',
      '172.28.',
      '172.29.',
      '172.30.',
      '172.31.',
    ];

    return dockerRanges.some((range) => ip.startsWith(range));
  }

  private isPduNetworkIp(ip: string): boolean {
    // PDU 통신용 네트워크 대역 필터링
    const pduRanges = [
      '192.168.2.', // PDU 전용 네트워크 대역
      '192.168.100.', // 일반적인 PDU/장비 제어용 대역
      '192.168.200.', // 추가 PDU 대역 (필요시)
    ];

    return pduRanges.some((range) => ip.startsWith(range));
  }

  private isVirtualMachineInterface(interfaceName: string): boolean {
    // 가상머신 관련 인터페이스 이름 패턴들
    const vmPatterns = [
      // VMware
      'vmnet',
      'vmware',
      'vboxnet',
      'virtualbox',

      // Hyper-V
      'vEthernet',
      'Hyper-V',

      // Docker Desktop
      'docker',
      'br-',
      'veth',

      // 기타 가상화
      'virbr',
      'virbr0',
      'vnet',
      'tap',
      'tun',
      'ppp',

      // Windows 가상 어댑터
      'VirtualBox Host-Only',
      'VMware Virtual Ethernet Adapter',
      'Hyper-V Virtual Ethernet Adapter',
      'Microsoft Wi-Fi Direct Virtual Adapter',
      'Microsoft Hosted Network Virtual Adapter',

      // Linux 가상 인터페이스
      'docker0',
      'lxc',
      'qemu',

      // 기타 패턴
      'Virtual',
      'VirtualBox',
      'VMware',
      'Hyper-V',
      'Docker',
    ];

    const lowerName = interfaceName.toLowerCase();
    return vmPatterns.some(
      (pattern) =>
        lowerName.includes(pattern.toLowerCase()) ||
        interfaceName.includes(pattern),
    );
  }

  private async getInstanceId(): Promise<string> {
    // 1. 환경변수에서 ROBOT_ID 확인
    if (process.env.ROBOT_ID) {
      return process.env.ROBOT_ID;
    }

    // 2. 전역 변수에서 robotSerial 확인
    if (global.robotSerial) {
      return global.robotSerial;
    }

    // 3. 데이터베이스에서 robotSerial 조회 (비동기)
    try {
      // VariablesService를 주입받아 사용하거나
      // 또는 직접 DB 조회
      const robotSerial = await this.getRobotSerialFromDB();
      if (robotSerial) return robotSerial;
    } catch (error) {
      console.warn('[mDNS] DB에서 robotSerial 조회 실패:', error);
    }

    // 4. 임시 ID 생성 (fallback)
    const host = os.hostname() || 'unknown-host';
    return `rb-${crypto.createHash('sha1').update(host).digest('hex').slice(0, 6)}`;
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
