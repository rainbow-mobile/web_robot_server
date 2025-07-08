import httpLogger from '@common/logger/http.logger';
import { HttpStatus, Injectable } from '@nestjs/common';
import { LessThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { MoveLogEntity } from './entity/move.entity';
import { HttpError } from '@influxdata/influxdb3-client';
import socketLogger from '@common/logger/socket.logger';
import { errorToJson } from '@common/util/error.util';

@Injectable()
export class MoveService {
  constructor(
    @InjectRepository(MoveLogEntity)
    private readonly moveRepository: Repository<MoveLogEntity>,
    private readonly socketGateway: SocketGateway,
  ) {}

  async getMoveLog(num: number, command?: string) {
    try {
      if (num === 0) {
        return await this.moveRepository.find({
          where: { command },
          order: { time: 'DESC' },
        });
      } else {
        return await this.moveRepository.find({
          where: { command },
          order: { time: 'DESC' },
          take: num,
        });
      }
    } catch (error) {
      if (error instanceof HttpError) throw error;
      socketLogger.error(`[MOVE] getMoveLog : ${errorToJson(error)}`);
    }
  }

  async saveLog(data: {
    command: string;
    goal_id?: string;
    goal_name?: string;
    map_name?: string;
    x?: number;
    y?: number;
    rz?: number;
  }) {
    if (
      data.command === 'stop' ||
      data.command === 'goal' ||
      data.command === 'target' ||
      data.command === 'pause' ||
      data.command === 'resume'
    ) {
      httpLogger.info(`[MOVE] saveLog : ${JSON.stringify(data)}`);

      //null 처리

      //save Log--------------------------------
      this.moveRepository.save({
        command: data.command,
        goal_id: data.goal_id ?? '',
        goal_name: data.goal_name ?? '',
        map_name: data.map_name ?? '',
        x: data.x ?? 0,
        y: data.y ?? 0,
        rz: data.rz ?? 0,
      });

      //일주일 지난 기록 삭제
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      await this.moveRepository.delete({
        time: LessThan(oneWeekAgo),
      });

      // 30개 초과 시 가장 오래된 거 삭제
      // const count = await this.moveRepository.count();
      // console.log('count : ', count);
      // if (count >= 30) {
      //   const oldest = await this.moveRepository.find({
      //     order: { time: 'ASC' }, // createdAt이 있다면
      //     take: count - 29,
      //   });
      //   await this.moveRepository.remove(oldest);
      // }

      //save Log--------------------------------
    }
  }
  async moveCommand(data: any) {
    return new Promise(async (resolve, reject) => {
      if (this.socketGateway.slamnav != null) {
        this.socketGateway.server.to('slamnav').emit('move', data);
        httpLogger.info(`[MOVE] moveCommand: ${JSON.stringify(data)}`);
        this.saveLog({
          command: data.command,
          goal_id: data.goal_id,
          // goal_name: data.goal_name ?? null,
          // map_name: data.map_name ?? null,
          x: data.x ? parseFloat(data.x) : null,
          y: data.x ? parseFloat(data.y) : null,
          rz: data.rz ? parseFloat(data.rz) : null,
        });

        this.socketGateway.slamnav.once('moveResponse', (data2) => {
          const responseJson = JSON.parse(data2);
          httpLogger.info(
            `[MOVE] moveCommand Response: ${responseJson.result}, ${JSON.stringify(data2)} `,
          );
          if (responseJson.result === 'accept' || responseJson.result === 'accept') {
            resolve(responseJson);
          } else {
            reject({ data: responseJson, status: HttpStatus.FORBIDDEN });
          }
          clearTimeout(timeoutId);
        });

        const timeoutId = setTimeout(() => {
          reject({
            status: HttpStatus.GATEWAY_TIMEOUT,
            data: { message: '프로그램이 응답하지 않습니다' },
          });
        }, 5000); // 5초 타임아웃
      } else {
        reject({
          status: HttpStatus.GATEWAY_TIMEOUT,
          data: { message: '프로그램이 연결되지 않았습니다' },
        });
      }
    });
  }

  async moveJog(data: object) {
    if (this.socketGateway.slamnav != null) {
      this.socketGateway.server.to('slamnav').emit('move', data);
    }
  }
}
