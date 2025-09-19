import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as mdns from 'multicast-dns';
import * as os from 'node:os';
import * as crypto from 'node:crypto';

type MdnsRecord = {
  name: string;
  type: string;
  ttl?: number;
  data: any;
};

@Injectable()
export class MdnsResponder implements OnModuleInit, OnModuleDestroy {
  private mdns = mdns({
    multicast: true,
    interface: '0.0.0.0', // 모든 인터페이스에서 수신
    port: 5353,
    ttl: 255, // 멀티캐스트 TTL 증가
  }); // UDP 5353 멀티캐스트 join
  private readonly serviceType = '_rainbow-robot._tcp.local';
  private readonly ttl = 120;

  private readonly instanceId = this.getInstanceId(); // 고유 식별자
  private readonly instanceName = `RainbowBot-${this.instanceId}`;
  private readonly instanceFqdn = `${this.instanceName}.${this.serviceType}`; // PTR → 이걸 가리킴
  private readonly targetHost = `${this.instanceName}.local`; // SRV target & A/AAAA name
  private readonly servicePort = Number(process.env.ROBOT_API_PORT ?? 3100);

  private announced = false;

  async onModuleInit() {
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

      // 클라가 우리 서비스 타입을 PTR/ANY로 물으면 응답
      const wants = packet.questions?.some((q) => {
        // 서비스 타입 쿼리
        if (
          q.name === this.serviceType &&
          (q.type === 'PTR' || q.type === 'ANY')
        ) {
          return true;
        }
        // 인스턴스 FQDN 쿼리
        if (
          q.name === this.instanceFqdn &&
          (q.type === 'SRV' || q.type === 'TXT' || q.type === 'ANY')
        ) {
          return true;
        }
        // 타겟 호스트 쿼리
        if (
          q.name === this.targetHost &&
          (q.type === 'A' || q.type === 'AAAA' || q.type === 'ANY')
        ) {
          return true;
        }
        // 와일드카드 쿼리 (모든 서비스 타입)
        if (
          q.name === '_services._dns-sd._udp.local' &&
          (q.type === 'PTR' || q.type === 'ANY')
        ) {
          return true;
        }
        // 일반적인 서비스 검색 쿼리
        if (
          q.name.includes('_tcp.local') &&
          (q.type === 'PTR' || q.type === 'ANY')
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
      this.respondAll();
    });

    // 부팅 직후 **자발 광고(unsolicited announcement)** 를 한 번 날려주면
    // 당신의 스캐너가 즉시 발견 가능 (쿼리 기다리지 않음)
    setTimeout(() => {
      console.log(`[mDNS] 자발 광고 시작`);
      this.respondAll();
      this.announced = true;
      console.log(`[mDNS] 자발 광고 완료`);

      // 추가 테스트: 주기적으로 광고 반복 (디버깅용)
      setInterval(() => {
        console.log(`[mDNS] 주기적 광고 (10초마다)`);
        this.respondAll();
      }, 10000); // 30초 -> 10초로 단축
    }, 100); // 500ms -> 100ms로 단축

    // 추가: 더 빠른 초기 광고를 위해 1초 후에도 한 번 더
    setTimeout(() => {
      if (this.announced) {
        console.log(`[mDNS] 추가 자발 광고 (1초 후)`);
        this.respondAll();
      }
    }, 1000);
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
            data: this.txtString(),
          },
          // A/AAAA도 ttl 0으로 내려도 되지만, 보통 PTR/SRV/TXT만 bye로 충분
        ],
      });
    }
    this.mdns.destroy();
  }

  private respondAll() {
    console.log(`[mDNS] 응답 생성 시작`);

    const addressRecords = this.addressRecords();

    // 모든 레코드를 answers에 포함 (mDNS 표준에 따라)
    const answers: MdnsRecord[] = [
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
        data: this.txtString(), // "version=1.2.3 model=S100 id=RB-0001 api=/api"
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
    console.log(
      `[mDNS] TXT 레코드: ${this.instanceFqdn} -> ${this.txtString()}`,
    );
    console.log(`[mDNS] A/AAAA 레코드 개수: ${addressRecords.length}`);

    // mDNS 표준에 따라 모든 레코드를 answers에 포함
    try {
      this.mdns.respond({ answers });
      console.log(`[mDNS] 응답 전송 완료 - 레코드 수: ${answers.length}`);

      // 전송된 레코드 상세 정보 로깅
      answers.forEach((record, index) => {
        console.log(
          `[mDNS] 레코드 ${index + 1}: ${record.name} (${record.type}) -> ${JSON.stringify(record.data)}`,
        );
      });
    } catch (error) {
      console.error(`[mDNS] 응답 전송 실패:`, error);
    }
  }

  private txtString(): string {
    // 당신의 Electron 파서가 "공백 구분 key=value" 문자열을 기대하므로 이렇게 보냅니다.
    const model = process.env.ROBOT_MODEL ?? 'S100';
    const fw = process.env.ROBOT_FW ?? '1.2.3';
    const id = process.env.ROBOT_ID ?? this.instanceId;
    const api = process.env.ROBOT_API_BASE ?? '/api';
    // 필요한 key만 최소한으로. (민감정보 X)
    return `version=${fw} model=${model} id=${id} api=${api}`;
  }

  private addressRecords(): MdnsRecord[] {
    // 가능한 로컬 IP들을 추출하여 A/AAAA를 만듭니다.
    const ifaces = os.networkInterfaces();
    const records: MdnsRecord[] = [];
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

      records.push({
        name: this.targetHost,
        type: primaryIp.ip.includes(':') ? 'AAAA' : 'A',
        ttl: this.ttl,
        data: primaryIp.ip,
      });

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

  private getInstanceId(): string {
    // 장치 고유값(시리얼 등) 사용 권장. 임시로 hostname+hash
    const host = os.hostname() || 'unknown-host';
    return `rb-${crypto.createHash('sha1').update(host).digest('hex').slice(0, 6)}`;
  }
}
