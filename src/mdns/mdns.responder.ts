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
  private mdns = mdns(); // UDP 5353 멀티캐스트 join
  private readonly serviceType = '_rainbow-robot._tcp.local';
  private readonly ttl = 120;

  private readonly instanceId = this.getInstanceId(); // 고유 식별자
  private readonly instanceName = `RainbowBot-${this.instanceId}`;
  private readonly instanceFqdn = `${this.instanceName}.${this.serviceType}`; // PTR → 이걸 가리킴
  private readonly targetHost = `${this.instanceName}.local`; // SRV target & A/AAAA name
  private readonly servicePort = Number(process.env.ROBOT_API_PORT ?? 3100);

  private announced = false;

  async onModuleInit() {
    // 쿼리 수신 시 응답
    this.mdns.on('query', (packet) => {
      // 클라가 우리 서비스 타입을 PTR/ANY로 물으면 응답
      const wants = packet.questions?.some(
        (q) =>
          (q.name === this.serviceType &&
            (q.type === 'PTR' || q.type === 'ANY')) ||
          (q.name === this.instanceFqdn &&
            (q.type === 'SRV' || q.type === 'TXT' || q.type === 'ANY')) ||
          (q.name === this.targetHost &&
            (q.type === 'A' || q.type === 'AAAA' || q.type === 'ANY')),
      );
      if (!wants) return;

      this.respondAll();
    });

    // 부팅 직후 **자발 광고(unsolicited announcement)** 를 한 번 날려주면
    // 당신의 스캐너가 즉시 발견 가능 (쿼리 기다리지 않음)
    setTimeout(() => {
      this.respondAll();
      this.announced = true;
    }, 500);
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
    const answers: MdnsRecord[] = [
      // 1) PTR: 타입 목록 → 인스턴스 FQDN
      {
        name: this.serviceType,
        type: 'PTR',
        ttl: this.ttl,
        data: this.instanceFqdn,
      },
    ];

    const additionals: MdnsRecord[] = [
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
      ...this.addressRecords(),
    ];

    this.mdns.respond({ answers, additionals });
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

    for (const name of Object.keys(ifaces)) {
      for (const info of ifaces[name] ?? []) {
        if (!info || info.internal) continue;
        if (info.family === 'IPv4' && info.address) {
          records.push({
            name: this.targetHost,
            type: 'A',
            ttl: this.ttl,
            data: info.address,
          });
        } else if (info.family === 'IPv6' && info.address) {
          // 링크로컬(fe80::)은 보통 생략. 필요시 포함
          if (!info.address.startsWith('fe80:')) {
            records.push({
              name: this.targetHost,
              type: 'AAAA',
              ttl: this.ttl,
              data: info.address,
            });
          }
        }
      }
    }

    // IP가 하나도 못 잡히는 극단 상황을 대비(옵션)
    if (records.length === 0) {
      // no-op
    }

    return records;
  }

  private getInstanceId(): string {
    // 장치 고유값(시리얼 등) 사용 권장. 임시로 hostname+hash
    const host = os.hostname() || 'unknown-host';
    return `rb-${crypto.createHash('sha1').update(host).digest('hex').slice(0, 6)}`;
  }
}
