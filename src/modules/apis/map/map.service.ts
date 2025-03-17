import httpLogger from '@common/logger/http.logger';
import { HttpStatus, Injectable } from '@nestjs/common';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import * as fs from 'fs';
import { homedir } from 'os';
import * as Path from 'path';
import * as moment from 'moment';
import { readCsv, readJson, saveCsv, saveJson } from '@common/util/file.util';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import { errorToJson } from '@common/util/error.util';

@Injectable()
export class MapService {
  constructor(private readonly socketGateway: SocketGateway) {}

  private mapDir: string = homedir() + '/maps';

  async getMapList() {
    return new Promise<any[]>(async (resolve, reject) => {
      try {
        const response = await this.parseMapList(this.mapDir);
        resolve(response.list);
      } catch (error) {
        reject(error);
      }
    });
  }

  async parseMapList(dir: string, father = { list: [] }) {
    return new Promise<{ list: any[] }>(async (resolve, reject) => {
      try {
        const files = await fs.promises.readdir(dir, { withFileTypes: true });
        for (const file of files) {
          if (file.isDirectory()) {
            const fullPath = dir + '/' + file.name;
            const stats = await fs.promises.stat(fullPath);

            const model = {
              name: file.name,
              modifyDt: moment(stats.mtime).format('yyyy-MM-DD HH:mm:ss'),
              list: [],
            };

            const models = await this.parseMapList(fullPath, model); // 재귀 호출

            if (models.list.find((obj) => obj.name === 'cloud.csv'))
              father.list.push(models);
          } else {
            if (
              file.name == 'cloud.csv' ||
              file.name == 'topo.json' ||
              file.name.split('.')[1] == 'task'
            ) {
              const fullPath = Path.join(dir, file.name);
              const stats = await fs.promises.stat(fullPath);
              father.list.push({
                name: file.name,
                modifyDt: moment(stats.mtime).format('yyyy-MM-DD HH:mm:ss'),
                size: stats.size,
              });
            }
          }
        }
        resolve(father);
      } catch (e) {
        httpLogger.error(`[MAP] parseMapList: ${errorToJson(e)}`);
        reject({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          data: {
            message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
          },
        });
      }
    });
  }

  async readCloud(mapNm: string) {
    return await readCsv(Path.join(this.mapDir, mapNm, 'cloud.csv'));
  }

  async saveCloud(mapNm: string, data: any[]) {
    return await saveCsv(Path.join(this.mapDir, mapNm, 'cloud.csv'), data);
  }

  async readTopology(mapNm: string) {
    return await readJson(Path.join(this.mapDir, mapNm, 'topo.json'));
  }

  async saveTopology(mapNm: string, data: JSON) {
    return await saveJson(Path.join(this.mapDir, mapNm, 'topo.json'), data);
  }

  async loadMap(mapNm: string) {
    return new Promise((resolve, reject) => {
      if (this.socketGateway.slamnav != null) {
        httpLogger.info(`[MAP] loadMap: ${mapNm}`);
        this.socketGateway.server.to('slamnav').emit('load', {
          command: 'mapload',
          name: mapNm,
          time: Date.now().toString(),
        });

        this.socketGateway.slamnav.once('loadResponse', (data) => {
          httpLogger.info(
            `[MAP] Slamnav Mapload Response: ${JSON.stringify(data)}`,
          );
          resolve(data);
          clearTimeout(timeoutId);
        });

        const timeoutId = setTimeout(() => {
          httpLogger.warn(`[MAP] loadMap: Timeout`);
          reject({
            status: HttpStatus.GATEWAY_TIMEOUT,
            data: { message: '프로그램이 응답하지 않습니다' },
          });
        }, 5000); // 5초 타임아웃
      } else {
        httpLogger.warn(`[MAP] loadMap: Disconnect`);
        reject({
          status: HttpStatus.GATEWAY_TIMEOUT,
          data: { message: '프로그램이 연결되지 않았습니다' },
        });
      }
    });
  }
}
