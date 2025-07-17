import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import path from 'path';
import * as fs from 'fs';
import * as ini from 'ini';

const ROBOT_INFO_CONF = 'robot-info.conf';

@Injectable()
export class ProcessService {
  constructor(private readonly configService: ConfigService) {}

  async getRobotInfo() {
    try {
      const dataBasePath = this.configService.get('dataBasePath');

      let robotInfoConf = path.join(dataBasePath, ROBOT_INFO_CONF);

      if (!fs.existsSync(robotInfoConf)) {
        await this.writeRobotInfo({});
        robotInfoConf = path.join(dataBasePath, ROBOT_INFO_CONF);
      }

      const robotInfoData = await fs.promises.readFile(robotInfoConf, 'utf-8');
      const config = ini.parse(robotInfoData);

      return config;
    } catch (error) {
      throw new InternalServerErrorException({
        message: `${ROBOT_INFO_CONF} 파일을 읽는데 실패했습니다.`,
        error,
      });
    }
  }

  async writeRobotInfo(body: any) {
    try {
      const dataBasePath = this.configService.get('dataBasePath');
      const robotInfoConf = path.join(dataBasePath, ROBOT_INFO_CONF);

      if (fs.existsSync(robotInfoConf)) {
        throw new BadRequestException({
          message: `${ROBOT_INFO_CONF} 파일이 이미 존재합니다.`,
        });
      }

      const iniContent = ini.stringify(body);

      await fs.promises.writeFile(robotInfoConf, iniContent, 'utf-8');

      return {
        robotInfo: body,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: `${ROBOT_INFO_CONF} 파일을 쓰는데 실패했습니다.`,
        error,
      });
    }
  }

  async updateRobotInfo(body: any) {
    try {
      const dataBasePath = this.configService.get('dataBasePath');
      const robotInfoConf = path.join(dataBasePath, ROBOT_INFO_CONF);

      const robotInfoData = await fs.promises.readFile(robotInfoConf, 'utf-8');
      const config = ini.parse(robotInfoData);

      Object.assign(config, body);

      const iniContent = ini.stringify(config);
      await fs.promises.writeFile(robotInfoConf, iniContent, 'utf-8');

      return {
        robotInfo: config,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: `${ROBOT_INFO_CONF} 파일을 업데이트하는데 실패했습니다.`,
        error,
      });
    }
  }

  async deleteRobotInfoData(body: { section: string; key: string }) {
    try {
      const dataBasePath = this.configService.get('dataBasePath');
      const robotInfoConf = path.join(dataBasePath, ROBOT_INFO_CONF);

      const robotInfoData = await fs.promises.readFile(robotInfoConf, 'utf-8');
      const config = ini.parse(robotInfoData);

      if (!config[body.section][body.key]) {
        throw new BadRequestException({
          message: `${ROBOT_INFO_CONF} 파일에 ${body.section} 섹션의 ${body.key} 키가 없습니다.`,
        });
      }

      delete config[body.section][body.key];

      const iniContent = ini.stringify(config);
      await fs.promises.writeFile(robotInfoConf, iniContent, 'utf-8');

      return {
        robotInfo: config,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: `${ROBOT_INFO_CONF} 파일을 삭제하는데 실패했습니다.`,
        error,
      });
    }
  }
}
