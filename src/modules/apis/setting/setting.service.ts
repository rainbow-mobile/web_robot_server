import { deleteFile, readJson, saveJson } from '@common/util/file.util';
import {
  GatewayTimeoutException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { homedir } from 'os';
import * as Path from 'path';
import * as fs from 'fs';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import { PresetDto } from 'src/modules/apis/setting/dto/setting.preset.dto';
import httpLogger from '@common/logger/http.logger';
import { errorToJson } from '@common/util/error.util';
import { exec } from 'child_process';
import { CameraOrderChangeDto } from './dto/setting.camera.dto';

@Injectable()
export class SettingService {
  constructor(private readonly socketGateway: SocketGateway) {}

  async getSetting(type: string) {
    const data = await readJson(
      Path.join(homedir(), 'slamnav2', 'config', type, 'config.json'),
    );
    return await this.transformSettingToJson(data);
  }

  async saveSetting(type: string, data: JSON) {
    try {
      const fileData = await this.transformSettingToJson(
        await readJson(
          Path.join(homedir(), 'slamnav2', 'config', type, 'config.json'),
        ),
      );
      const stringData = await this.convertNumbersToStrings(data);
      console.log('!!!!!!!!!!!!!!!!!!!!', stringData);
      const mergeData = await this.deepMerge(fileData, stringData);
      const newData = await this.transformSettingToFile(mergeData);

      const response = await saveJson(
        Path.join(homedir(), 'slamnav2', 'config', type, 'config.json'),
        newData,
      );

      if (this.socketGateway.slamnav != null) {
        exec('pm2 restart SLAMNAV2');
      }

      return response;
    } catch (error) {
      httpLogger.error(`[SETTING] saveSetting: ${errorToJson(error)}`);
    }
  }

  async convertNumbersToStrings(
    obj: Record<string, any>,
  ): Promise<Record<string, any>> {
    const entries = await Promise.all(
      Object.entries(obj).map(async ([key, value]) => [
        key,
        typeof value === 'number'
          ? value.toString()
          : typeof value === 'object' && value !== null
            ? await this.convertNumbersToStrings(value) // 재귀 호출
            : value,
      ]),
    );
    return Object.fromEntries(entries);
  }

  async getPreset(type: string, id: string) {
    return await readJson(
      Path.join(
        homedir(),
        'slamnav2',
        'config',
        type,
        'preset_' + id + '.json',
      ),
    );
  }

  async deletePreset(type: string, id: string) {
    return await deleteFile(
      Path.join(
        homedir(),
        'slamnav2',
        'config',
        type,
        'preset_' + id + '.json',
      ),
    );
  }

  async makePreset(type: string, id: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const dir = Path.join(
          homedir(),
          'slamnav2',
          'config',
          type,
          'preset_' + id + '.json',
        );
        if (fs.existsSync(dir)) {
          reject({
            status: HttpStatus.CONFLICT,
            data: { message: HttpStatusMessagesConstants.FILE.DUPLICATE_WRITE },
          });
        } else {
          const tempData = {
            LIMIT_V: '1.0',
            LIMIT_W: '45.0',
            LIMIT_V_ACC: '0.3',
            LIMIT_V_DCC: '0.1',
            LIMIT_W_ACC: '180.0',
            LIMIT_PIVOT_W: '45.0',
            ST_V: '0.05',
            ED_V: '0.05',
            DRIVE_T: '0.0',
            DRIVE_H: '4.0',
            DRIVE_A: '0.8',
            DRIVE_B: '0.05',
            DRIVE_L: '0.3',
            DRIVE_K: '0.8',
            DRIVE_EPS: '0.3',
          };
          const response = await saveJson(dir, tempData);
          resolve(tempData);
        }
      } catch (error) {
        reject({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          data: {
            message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
          },
        });
      }
    });
  }
  async savePreset(type: string, id: string, data: PresetDto) {
    return new Promise(async (resolve, reject) => {
      try {
        const fileData = await readJson(
          Path.join(
            homedir(),
            'slamnav2',
            'config',
            type,
            'preset_' + id + '.json',
          ),
        );
        const mergeData = await this.deepMerge(fileData, data);

        resolve(
          await saveJson(
            Path.join(
              homedir(),
              'slamnav2',
              'config',
              type,
              'preset_' + id + '.json',
            ),
            mergeData,
          ),
        );
      } catch (error) {
        httpLogger.error(`[SETTING] savePreset: ${errorToJson(error)}`);
        reject(error);
      }
    });
  }
  async getPresetList(type: string) {
    return new Promise(async (resolve, reject) => {
      try {
        const path = Path.join(homedir(), 'slamnav2', 'config', type);
        const nums = [];
        const files = await fs.promises.readdir(path, { withFileTypes: true });

        for (const file of files) {
          if (!file.isDirectory()) {
            if (file.name.split('.')[0].split('_')[0] == 'preset') {
              if (file.name.split('.')[0].split('_').length > 1) {
                const num = parseInt(file.name.split('.')[0].split('_')[1]);
                const newname = 'preset_' + num + '.json';
                if (file.name == newname) {
                  nums.push(num);
                }
              }
            }
          }
        }
        resolve(nums);
      } catch (error) {
        httpLogger.error(`[SETTING] getPresetLIst: ${errorToJson(error)}`);
        if (error.code == 'ENOENT') {
          reject({
            status: HttpStatus.NOT_FOUND,
            message: HttpStatusMessagesConstants.FILE.NOT_FOUND_404,
          });
        } else {
          reject({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: HttpStatusMessagesConstants.FILE.FAIL_READ_500,
          });
        }
      }
    });
  }

  async transformSettingToJson(data) {
    if (data != undefined) {
      const new_default = {
        ...data.default,
        LIDAR_TF_B_X: data.default.LIDAR_TF_B
          ? data.default.LIDAR_TF_B.split(',')[0]
          : 0,
        LIDAR_TF_B_Y: data.default.LIDAR_TF_B
          ? data.default.LIDAR_TF_B.split(',')[1]
          : 0,
        LIDAR_TF_B_Z: data.default.LIDAR_TF_B
          ? data.default.LIDAR_TF_B.split(',')[2]
          : 0,
        LIDAR_TF_B_RX: data.default.LIDAR_TF_B
          ? data.default.LIDAR_TF_B.split(',')[3]
          : 0,
        LIDAR_TF_B_RY: data.default.LIDAR_TF_B
          ? data.default.LIDAR_TF_B.split(',')[4]
          : 0,
        LIDAR_TF_B_RZ: data.default.LIDAR_TF_B
          ? data.default.LIDAR_TF_B.split(',')[5]
          : 0,
        LIDAR_TF_F_X: data.default.LIDAR_TF_F
          ? data.default.LIDAR_TF_F.split(',')[0]
          : 0,
        LIDAR_TF_F_Y: data.default.LIDAR_TF_F
          ? data.default.LIDAR_TF_F.split(',')[1]
          : 0,
        LIDAR_TF_F_Z: data.default.LIDAR_TF_F
          ? data.default.LIDAR_TF_F.split(',')[2]
          : 0,
        LIDAR_TF_F_RX: data.default.LIDAR_TF_F
          ? data.default.LIDAR_TF_F.split(',')[3]
          : 0,
        LIDAR_TF_F_RY: data.default.LIDAR_TF_F
          ? data.default.LIDAR_TF_F.split(',')[4]
          : 0,
        LIDAR_TF_F_RZ: data.default.LIDAR_TF_F
          ? data.default.LIDAR_TF_F.split(',')[5]
          : 0,
      };
      const new_cam = {
        ...data.cam,
        CAM_TF_0_X: data.cam.CAM_TF_0 ? data.cam.CAM_TF_0.split(',')[0] : 0,
        CAM_TF_0_Y: data.cam.CAM_TF_0 ? data.cam.CAM_TF_0.split(',')[1] : 0,
        CAM_TF_0_Z: data.cam.CAM_TF_0 ? data.cam.CAM_TF_0.split(',')[2] : 0,
        CAM_TF_0_RX: data.cam.CAM_TF_0 ? data.cam.CAM_TF_0.split(',')[3] : 0,
        CAM_TF_0_RY: data.cam.CAM_TF_0 ? data.cam.CAM_TF_0.split(',')[4] : 0,
        CAM_TF_0_RZ: data.cam.CAM_TF_0 ? data.cam.CAM_TF_0.split(',')[5] : 0,
        CAM_TF_1_X: data.cam.CAM_TF_1 ? data.cam.CAM_TF_1.split(',')[0] : 0,
        CAM_TF_1_Y: data.cam.CAM_TF_1 ? data.cam.CAM_TF_1.split(',')[1] : 0,
        CAM_TF_1_Z: data.cam.CAM_TF_1 ? data.cam.CAM_TF_1.split(',')[2] : 0,
        CAM_TF_1_RX: data.cam.CAM_TF_1 ? data.cam.CAM_TF_1.split(',')[3] : 0,
        CAM_TF_1_RY: data.cam.CAM_TF_1 ? data.cam.CAM_TF_1.split(',')[4] : 0,
        CAM_TF_1_RZ: data.cam.CAM_TF_1 ? data.cam.CAM_TF_1.split(',')[5] : 0,
      };
      const newdata = { ...data, default: new_default, cam: new_cam };
      return newdata;
    } else {
      return {};
    }
  }

  async transformSettingToFile(data) {
    if (data != undefined) {
      if (data.default) {
        const lidar_tf_b =
          (data.default.LIDAR_TF_B_X ? data.default.LIDAR_TF_B_X : '0') +
          ',' +
          (data.default.LIDAR_TF_B_Y ? data.default.LIDAR_TF_B_Y : '0') +
          ',' +
          (data.default.LIDAR_TF_B_Z ? data.default.LIDAR_TF_B_Z : '0') +
          ',' +
          (data.default.LIDAR_TF_B_RX ? data.default.LIDAR_TF_B_RX : '0') +
          ',' +
          (data.default.LIDAR_TF_B_RY ? data.default.LIDAR_TF_B_RY : '0') +
          ',' +
          (data.default.LIDAR_TF_B_RZ ? data.default.LIDAR_TF_B_RZ : '0');

        const lidar_tf_f =
          (data.default.LIDAR_TF_F_X ? data.default.LIDAR_TF_F_X : '0') +
          ',' +
          (data.default.LIDAR_TF_F_Y ? data.default.LIDAR_TF_F_Y : '0') +
          ',' +
          (data.default.LIDAR_TF_F_Z ? data.default.LIDAR_TF_F_Z : '0') +
          ',' +
          (data.default.LIDAR_TF_F_RX ? data.default.LIDAR_TF_F_RX : '0') +
          ',' +
          (data.default.LIDAR_TF_F_RY ? data.default.LIDAR_TF_F_RY : '0') +
          ',' +
          (data.default.LIDAR_TF_F_RZ ? data.default.LIDAR_TF_F_RZ : '0');

        const newdefault = {
          ...data.default,
          LIDAR_TF_B: lidar_tf_b,
          LIDAR_TF_F: lidar_tf_f,
        };

        data = await {
          ...data,
          default: {
            ...data.default,
            LIDAR_TF_B: lidar_tf_b,
            LIDAR_TF_F: lidar_tf_f,
          },
        };
      }

      if (data.cam) {
        const camera_tf_0 =
          (data.cam.CAM_TF_0_X ? data.cam.CAM_TF_0_X : '0') +
          ',' +
          (data.cam.CAM_TF_0_Y ? data.cam.CAM_TF_0_Y : '0') +
          ',' +
          (data.cam.CAM_TF_0_Z ? data.cam.CAM_TF_0_Z : '0') +
          ',' +
          (data.cam.CAM_TF_0_RX ? data.cam.CAM_TF_0_RX : '0') +
          ',' +
          (data.cam.CAM_TF_0_RY ? data.cam.CAM_TF_0_RY : '0') +
          ',' +
          (data.cam.CAM_TF_0_RZ ? data.cam.CAM_TF_0_RZ : '0');
        const camera_tf_1 =
          (data.cam.CAM_TF_1_X ? data.cam.CAM_TF_1_X : '0') +
          ',' +
          (data.cam.CAM_TF_1_Y ? data.cam.CAM_TF_1_Y : '0') +
          ',' +
          (data.cam.CAM_TF_1_Z ? data.cam.CAM_TF_1_Z : '0') +
          ',' +
          (data.cam.CAM_TF_1_RX ? data.cam.CAM_TF_1_RX : '0') +
          ',' +
          (data.cam.CAM_TF_1_RY ? data.cam.CAM_TF_1_RY : '0') +
          ',' +
          (data.cam.CAM_TF_1_RZ ? data.cam.CAM_TF_1_RZ : '0');

        data = {
          ...data,
          cam: { ...data.cam, CAM_TF_0: camera_tf_0, CAM_TF_1: camera_tf_1 },
        };
      }

      return data;
    } else {
      return {};
    }
  }

  // 배열 항목을 특정 키로 비교하며 병합하는 함수
  async mergeArrayByKey(oldArray, newArray, key) {
    const mergedArray = [...oldArray];

    newArray.forEach((newItem) => {
      const index = mergedArray.findIndex(
        (oldItem) => oldItem[key] === newItem[key],
      );

      if (index > -1) {
        // 기존 항목이 있는 경우 해당 항목을 업데이트
        mergedArray[index] = { ...mergedArray[index], ...newItem };
      } else {
        // 새로운 항목인 경우 추가
        mergedArray.push(newItem);
      }
    });

    return mergedArray;
  }

  // 변경되지 않은 항목을 유지하면서 JSON 객체 병합하는 함수
  async deepMerge(oldData, newData): Promise<any> {
    const result = { ...oldData };
    for (const key in newData) {
      if (Array.isArray(newData[key])) {
        // 배열인 경우 특정 키로 병합
        result[key] = this.mergeArrayByKey(
          oldData[key] || [],
          newData[key],
          'number',
        );
      } else if (
        typeof newData[key] === 'object' &&
        !Array.isArray(newData[key])
      ) {
        result[key] = await this.deepMerge(oldData[key] || {}, newData[key]);
      } else {
        result[key] = newData[key];
      }
    }

    return result;
  }

  async cameraOrderChange(data: CameraOrderChangeDto) {
    return new Promise((resolve, reject) => {
      if (this.socketGateway.slamnav != null) {
        this.socketGateway.server.to('slamnav').emit('swUpdate', data);

        this.socketGateway.slamnav.once('cameraOrderChangeResponse', (res) => {
          if (res.status === 200) {
            httpLogger.info(
              `[UPDATE] cameraOrderChange Response: ${JSON.stringify(res.orderInfo)}`,
            );

            resolve(res.orderInfo);
          }
          clearTimeout(timeoutId);
        });

        const timeoutId = setTimeout(() => {
          reject(new GatewayTimeoutException('프로그램이 연결되지 않았습니다'));
        }, 5000); // 5초 타임아웃
      }
    });
  }
}
