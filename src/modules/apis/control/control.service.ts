import httpLogger from '@common/logger/http.logger';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { ExternalCommandDto } from './dto/external.control.dto';
import { stringifyAllValues } from '@common/util/network.util';
import { generateGeneralLog } from '@common/logger/equipment.logger';
import {
  FootOperationName,
  GeneralLogType,
  GeneralScope,
  GeneralStatus,
  GeneralOperationStatus,
} from '@common/enum/equipment.enum';

@Injectable()
export class ControlService {
  constructor(private readonly socketGateway: SocketGateway) {}

  async mappingCommand(data: { command: string; time: string; name?: string }) {
    return new Promise((resolve, reject) => {
      if (this.socketGateway.slamnav != null) {
        this.socketGateway.server.to('slamnav').emit('mapping', data);
        httpLogger.info(`[CONTROL] mapping: ${JSON.stringify(data)}`);

        this.socketGateway.slamnav.once('mappingResponse', (data2) => {
          httpLogger.info(
            `[CONTROL] mapping Response: ${JSON.stringify(data2)}`,
          );
          resolve(data2);
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

  async SafetyFieldRequest(dto: {
    command: string;
    set_field?: number;
    reset_flag?: string;
  }) {
    return new Promise((resolve, reject) => {
      httpLogger.debug(`[CONTROL] SafetyFieldRequest : ${JSON.stringify(dto)}`);
      if (this.socketGateway.slamnav != null) {
        if (dto.command === 'getField') {
        } else if (dto.command === 'setField') {
          if (dto.set_field === undefined) {
            reject(
              new HttpException(
                `set_field(${dto.set_field}) 값이 지정되지 않았습니다.`,
                HttpStatus.BAD_REQUEST,
              ),
            );
          }
        } else if (dto.command === 'resetFlag') {
          if(dto.reset_flag === undefined || dto.reset_flag === '') {
            reject(
              new HttpException(
                `reset_flag(${dto.reset_flag}) 값이 지정되지 않았습니다.`,
                HttpStatus.BAD_REQUEST,
              ),
            );
          }
        } else {
          reject(
            new HttpException(
              `알 수 없는 command(${dto.command}) 값입니다.`,
              HttpStatus.BAD_REQUEST,
            ),
          );
        }

        this.socketGateway.slamnav.emit(
          'safetyRequest',
          stringifyAllValues({ ...dto, time: Date.now().toString() }),
        );
        httpLogger.info(`[CONTROL] safetyRequest: ${JSON.stringify(dto)}`);

        this.socketGateway.slamnav.once('safetyResponse', (data) => {
          httpLogger.info(`[CONTROL] safetyResponse: ${JSON.stringify(data)}`);
          const json = JSON.parse(data);
          clearTimeout(timeoutId);
          if (json.result === 'success') {
            resolve(json);
          } else {
            reject(
              new HttpException(
                '명령을 수행할 수 없습니다 : ' + data.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
            );
          }
        });
        const timeoutId = setTimeout(() => {
          reject(
            new HttpException(
              '프로그램이 응답하지 않습니다',
              HttpStatus.GATEWAY_TIMEOUT,
            ),
          );
        }, 5000); // 5초 타임아웃
      } else {
        reject(
          new HttpException(
            '프로그램이 연결되지 않았습니다',
            HttpStatus.GATEWAY_TIMEOUT,
          ),
        );
      }
    });
  }

  async ledControl(data: { command: string; led: string }) {
    return new Promise((resolve, reject) => {
      if (this.socketGateway.slamnav != null) {
        this.socketGateway.server
          .to('slamnav')
          .emit('led', { ...data, time: Date.now().toString() });
        httpLogger.info(`[CONTROL] led: ${JSON.stringify(data)}`);
        resolve({});
      } else {
        reject({
          status: HttpStatus.GATEWAY_TIMEOUT,
          data: { message: '프로그램이 연결되지 않았습니다' },
        });
      }
    });
  }
  async sendCommand(topic, data) {
    return new Promise((resolve, reject) => {
      if (this.socketGateway.slamnav != null) {
        this.socketGateway.server
          .to('slamnav')
          .emit(topic, { ...data, time: Date.now().toString() });
        httpLogger.info(`[CONTROL] sendCommand: ${JSON.stringify(data)}`);
        resolve({});
      } else {
        reject({
          status: HttpStatus.GATEWAY_TIMEOUT,
          data: { message: '프로그램이 연결되지 않았습니다' },
        });
      }
    });
  }

  async externalCommand(request: ExternalCommandDto) {
    return new Promise((resolve, reject) => {
      if (this.socketGateway.externalAccessory != null) {
        const data = { ...request, time: Date.now().toString() };
        this.socketGateway.externalAccessory.emit(
          'externalCommand',
          stringifyAllValues(data),
        );
        httpLogger.info(`[CONTROL] externalCommand: ${JSON.stringify(data)}`);

        this.socketGateway.externalAccessory.once(
          'externalResponse',
          (resp) => {
            httpLogger.info(
              `[CONTROL] externalResponse: ${JSON.stringify(resp)}`,
            );
            resolve(resp);
            clearTimeout(timeoutId);
          },
        );

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

  async dockCommand(data: { command: string; time: string }) {
    return new Promise((resolve, reject) => {
      if (this.socketGateway.slamnav != null) {
        this.socketGateway.server.to('slamnav').emit('dock', data);
        httpLogger.info(`[CONTROL] dock: ${JSON.stringify(data)}`);

        this.socketGateway.slamnav.once('dockResponse', (data2) => {
          httpLogger.info(`[CONTROL] dock Response: ${JSON.stringify(data2)}`);
          clearTimeout(timeoutId);
          resolve(data2);
        });

        const timeoutId = setTimeout(() => {
          reject({
            status: HttpStatus.GATEWAY_TIMEOUT,
            data: { message: '프로그램이 응답하지 않습니다' },
          });
        }, 30000); // 30초 타임아웃
      } else {
        reject({
          status: HttpStatus.GATEWAY_TIMEOUT,
          data: { message: '프로그램이 연결되지 않았습니다' },
        });
      }
    });
  }

  async Localization(data: {
    command: string;
    time: string;
    x?: string;
    y?: string;
    z?: string;
    rz?: string;
  }) {
    return new Promise((resolve, reject) => {
      if (this.socketGateway.slamnav != null) {
        this.socketGateway.server.to('slamnav').emit('localization', data);
        httpLogger.info(`[CONTROL] localization: ${JSON.stringify(data)}`);

        if (data.command == 'start' || data.command == 'stop') {
          resolve({ command: data.command, result: 'accept' });
        } else {
          this.socketGateway.slamnav.once('localizationResponse', (data2) => {
            httpLogger.info(
              `[CONTROL] localization Response: ${JSON.stringify(data2)}`,
            );
            resolve(data2);
            clearTimeout(timeoutId);
          });
        }

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
}
