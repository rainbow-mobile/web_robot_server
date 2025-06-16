import { HttpStatus, Injectable } from '@nestjs/common';
import { ReqUpdateSoftwareDto } from './dto/update.dto';
import * as path from 'path';
import { homedir } from 'os';
import * as fs from 'fs';
import { SOFTWARE_DIR, RELEASE_REPO_URL } from './constants/software.c';
import { execSync } from 'child_process';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import httpLogger from '@common/logger/http.logger';

@Injectable()
export class UpdateService {
  constructor(private readonly socketGateway: SocketGateway) {}

  updateSoftware({ software, branch }: ReqUpdateSoftwareDto) {
    if (software === 'rrs') {
      return this.rrsUpdate(branch);
    }
  }

  rrsUpdate(branch: string) {
    const updateScript = path.join(
      homedir(),
      `rainbow-deploy-kit/${SOFTWARE_DIR['rrs']}`,
      'rrs-update.sh',
    );

    if (!fs.existsSync(updateScript)) {
      throw {
        status: 404,
        data: {
          message: 'rrs-update.sh 파일을 찾을 수 없습니다.',
        },
      };
    }

    execSync(`bash ${updateScript} ${branch}`);

    return {
      status: 200,
      data: {
        message: 'rrs 업데이트 요청 완료',
      },
    };
  }

  otherSwUpdate(data: { branch: string }) {
    return new Promise((resolve, reject) => {
      if (this.socketGateway.slamnav != null) {
        this.socketGateway.server.to('slamnav').emit('software_update', data);
        httpLogger.info(`[UPDATE] software_update: ${JSON.stringify(data)}`);

        this.socketGateway.slamnav.once('software_update_response', (data2) => {
          httpLogger.info(
            `[UPDATE] software_update Response: ${JSON.stringify(data2)}`,
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

  async getCurrentVersion(software: string) {
    const softwareDir = SOFTWARE_DIR[software];

    try {
      const versionPath = path.join(homedir(), softwareDir, 'version.json');
      const versionData = await fs.promises.readFile(versionPath, 'utf-8');
      return JSON.parse(versionData);
    } catch (_error) {
      throw {
        status: 404,
        data: {
          message: `[${software}] version.json 파일을 찾을 수 없습니다.`,
        },
      };
    }
  }

  async getNewVersion({
    software,
    branch,
  }: {
    software: string;
    branch: string;
  }) {
    const softwareDir = SOFTWARE_DIR[software];
    const newVersionUrl = `${RELEASE_REPO_URL}/${branch}/${softwareDir}/version.json`;

    try {
      const newVersionData = await fetch(newVersionUrl);
      return newVersionData.json();
    } catch (_error) {
      throw {
        status: 404,
        data: {
          message: `[${software}] ${branch} 브랜치의 version.json 파일을 찾을 수 없습니다.`,
        },
      };
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} update`;
  }

  update() {
    return `This action updates  update`;
  }

  remove(id: number) {
    return `This action removes a #${id} update`;
  }
}
