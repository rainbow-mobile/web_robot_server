import {
  BadRequestException,
  GatewayTimeoutException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReqUpdateSoftwareDto } from './dto/update.update.dto';
import * as path from 'path';
import { homedir } from 'os';
import * as fs from 'fs';
import {
  SOFTWARE_DIR,
  RELEASE_REPO_RAW_URL,
  RELEASE_REPO_URL,
} from './constants/software.c';
import { exec, execSync } from 'child_process';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import httpLogger from '@common/logger/http.logger';

@Injectable()
export class UpdateService {
  constructor(private readonly socketGateway: SocketGateway) {}

  /**
   * 리포지토리 접근 확인 (외부망 접근 및 통신 확인)
   * @returns 리포지토리 접근 여부
   */
  async checkRepositoryAccess() {
    try {
      const response = await fetch(RELEASE_REPO_URL);
      if (!response.ok) {
        throw new BadRequestException('Repository access failed');
      }
      return response.ok;
    } catch (_error) {
      throw new BadRequestException('Repository access failed');
    }
  }

  /**
   * 소프트웨어 업데이트
   * @param software 소프트웨어 이름
   * @param branch 브랜치 이름
   * @returns 업데이트 요청 결과
   */
  updateSoftware({ software, branch, version }: ReqUpdateSoftwareDto) {
    if (software === 'rrs') {
      return this.rrsUpdate({ branch, version });
    }

    return this.otherSwUpdate({ branch, version });
  }

  /**
   * rrs 업데이트
   * @param branch 브랜치 이름
   * @returns 업데이트 요청 결과
   */
  rrsUpdate({ branch, version }: { branch?: string; version?: string } = {}) {
    const updateScript = path.join(
      homedir(),
      `rainbow-deploy-kit/rrs-server`,
      'rrs-update.sh',
    );

    const rainbowDeployKitDir = path.join(homedir(), 'rainbow-deploy-kit');

    if (!fs.existsSync(updateScript)) {
      throw new NotFoundException({
        message: `~/rainbow-deploy-kit/rrs-server/rrs-update.sh 파일을 찾을 수 없습니다.`,
      });
    }

    execSync('git pull', {
      cwd: rainbowDeployKitDir,
      stdio: 'pipe',
    });

    exec(
      `nohup bash ${updateScript} --mode=${branch || 'main'} --version=${version} > /tmp/rrs-update.log 2>&1 &`,
    );

    return { applyReqUpdate: true, version: version || '', rejectReason: '' };
  }

  /**
   * 기타 소프트웨어 업데이트
   * @param data 업데이트 요청 데이터
   * @returns 업데이트 요청 결과
   */
  otherSwUpdate({
    branch,
    version,
  }: { branch?: string; version?: string } = {}) {
    return new Promise((resolve, reject) => {
      if (this.socketGateway.slamnav != null) {
        const data = {
          branch: branch || 'main',
          version: version || '',
        };

        this.socketGateway.server.to('slamnav').emit('swUpdate', data);
        httpLogger.info(`[UPDATE] swUpdate: ${JSON.stringify(data)}`);

        this.socketGateway.slamnav.once('swUpdateResponse', (res) => {
          httpLogger.info(
            `[UPDATE] software_update Response: ${JSON.stringify(res)}`,
          );

          httpLogger.info(
            `[UPDATE] software_update applyReqUpdate: ${JSON.stringify(
              res.applyReqUpdate,
            )}`,
          );

          if (res.applyReqUpdate) {
            res.applyReqUpdate = res.applyReqUpdate === 'true';
          } else {
            httpLogger.info(
              `[UPDATE] software_update applyReqUpdate falsy: ${res.applyReqUpdate}`,
            );
          }

          resolve(res);
          clearTimeout(timeoutId);
        });

        const timeoutId = setTimeout(() => {
          reject(new GatewayTimeoutException('프로그램이 연결되지 않았습니다'));
        }, 5000); // 5초 타임아웃
      } else {
        reject(new GatewayTimeoutException('프로그램이 연결되지 않았습니다'));
      }
    });
  }

  /**
   * 소프트웨어 현재 버전 조회
   * @param software 소프트웨어 이름
   * @returns 현재 버전 정보를 담은 version.json 파일 내용
   */
  async getCurrentVersion(software: string) {
    if (software === 'rrs') {
      return this.getRrsCurrentVersion();
    }

    return this.getOtherSwCurrentVersion({ software });
  }

  async getRrsCurrentVersion() {
    try {
      const rrsDir = path.join(homedir(), SOFTWARE_DIR['rrs']);
      const versionPath = path.join(rrsDir, 'version.json');
      const versionData = await fs.promises.readFile(versionPath, 'utf-8');
      return JSON.parse(versionData);
    } catch (_error) {
      throw new NotFoundException({
        message: `[rrs] version.json 파일을 찾을 수 없습니다.`,
      });
    }
  }

  async getOtherSwCurrentVersion(data: { software?: string } = {}) {
    return new Promise((resolve, reject) => {
      if (this.socketGateway.slamnav != null) {
        this.socketGateway.server.to('slamnav').emit('swVersionInfo', data);
        httpLogger.info(`[UPDATE] swVersionInfo: ${JSON.stringify(data)}`);

        this.socketGateway.slamnav.once('swVersionInfoResponse', (res) => {
          httpLogger.info(
            `[UPDATE] swVersionInfo Response: ${JSON.stringify(res)}`,
          );
          resolve(res);
          clearTimeout(timeoutId);
        });

        const timeoutId = setTimeout(() => {
          reject(new GatewayTimeoutException('프로그램이 연결되지 않았습니다'));
        }, 5000); // 5초 타임아웃
      } else {
        reject(new GatewayTimeoutException('프로그램이 연결되지 않았습니다'));
      }
    });
  }

  /**
   * 소프트웨어 새로운 버전 조회
   * @param software 소프트웨어 이름
   * @param branch 브랜치 이름
   * @returns 새로운 버전 정보를 담은 version.json 파일 내용
   */
  async getNewVersion({
    software,
    branch,
  }: {
    software: string;
    branch: string;
  }) {
    await this.checkRepositoryAccess();

    const softwareDir = SOFTWARE_DIR[software];
    const newVersionUrl = `${RELEASE_REPO_RAW_URL}/${branch}/${softwareDir}/version.json`;

    try {
      const newVersionData = await fetch(newVersionUrl);
      return newVersionData.json();
    } catch (_error) {
      throw new NotFoundException({
        message: `[${software}] ${branch} 브랜치의 version.json 파일을 찾을 수 없습니다.`,
      });
    }
  }
}
