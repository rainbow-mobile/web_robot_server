import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as dgram from 'dgram';
import * as xml2js from 'xml2js';

const MULTICAST_ADDRESS = '239.255.255.250';
const PORT = 3702;

@Injectable()
export class WSDiscoveryService implements OnModuleInit {
  server = dgram.createSocket('udp4');

  // Probe 요청에 대한 응답 생성
  async probeResponse(message, rinfo) {
    let probeMatchMsg = fs
      .readFileSync(
        '/home/rainbow/server./web_robot_server/src/modules/apis/onvif/query/probematches.xml',
      )
      .toString();

    probeMatchMsg = probeMatchMsg.replace(
      '__MESSAGE_ID__',
      await this.generateUUID(),
    );
    probeMatchMsg = probeMatchMsg.replace(
      '__RELATES_TO__',
      message['Envelope']['Header']['MessageID'],
    );
    probeMatchMsg = probeMatchMsg.replace('__INSTANCE_ID__', '66666');
    probeMatchMsg = probeMatchMsg.replace('__MESSAGE_NUMBER__', '1');
    probeMatchMsg = probeMatchMsg.replace(
      '__ADDRESS__',
      await this.generateUUID(),
    );
    probeMatchMsg = probeMatchMsg.replace(
      '__XADDRS__',
      'http://192.168.1.88:11334/api/onvif/device_service',
    );
    probeMatchMsg = probeMatchMsg.replace('__MESSAGE_NUMBER__', '');
    // console.log('-----------------------------');
    // console.log('SEND:', probeMatchMsg);
    const messageBuffer = Buffer.from(probeMatchMsg, 'utf-8');
    console.log('-----------------------------');

    // this.server.setBroadcast(true);
    // this.server.setMulticastTTL(2);
    // this.server.setMulticastLoopback(true);
    // 응답 전송

    // console.log(messageBuffer.length);
    this.server.send(
      messageBuffer,
      0,
      messageBuffer.length,
      // 3702,
      // '239.255.255.250',
      rinfo.port,
      rinfo.address,
      (err) => {
        if (err) console.log('Error sending response:', err);
      },
    );
  }

  async hello() {
    const helloMsg = fs.readFileSync(
      '/home/rainbow/server./web_robot_server/src/modules/apis/onvif/query/hello.xml',
    );

    this.server.send(
      helloMsg,
      0,
      helloMsg.length,
      3702,
      '239.255.255.250',
      (err) => {
        if (err) console.error('Error Sending Hello : ', err);
      },
    );
  }

  // 고유 UUID 생성 (UUID v4)
  async generateUUID() {
    return '184778f9-c15d-432a-bb58-a71a03e36b14';
    return '12345678-1234-1234-1234-1234567890ab';
  }

  async onModuleInit() {
    // setInterval(() => {
    //   this.hello();
    // }, 5000);

    // Probe 요청을 듣고 응답하기
    this.server.on('message', (msg, rinfo) => {
      const parser = new xml2js.Parser({
        explicitArray: false,
        tagNameProcessors: [xml2js.processors.stripPrefix],
      });

      parser.parseString(msg, (err, result) => {
        if (err) {
          console.log('Error parsing XML:', err);
          return;
        }

        // console.log(JSON.stringify(result));
        // console.log('===============================');
        // console.log(JSON.stringify(result));
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
            this.probeResponse(result, rinfo);
          }
        }
      });
    });

    // Multicast 그룹에 가입하여 요청을 대기
    this.server.bind(PORT, () => {
      this.server.addMembership(MULTICAST_ADDRESS);
      console.log(`ONVIF server listening on ${MULTICAST_ADDRESS}:${PORT}`);
    });
  }
}
