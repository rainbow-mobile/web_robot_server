import {
  BadRequestException,
  GatewayTimeoutException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ReqUpdateSoftwareDto,
  WebUIAppAddDto,
  WebUIAppDeleteDto,
} from './dto/update.update.dto';
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
import {
  GetReleaseAppsBranchesDto,
  GetReleaseAppsVersionListDto,
} from './dto/update.get.dto';
import * as crypto from 'crypto';

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
   * 타겟 호스트에 30번 ping 전송
   * @param target 타겟 호스트
   */
  pingSendToTarget(target: string) {
    exec(`ping -c 30 ${target}`, (error, stdout, stderr) => {
      if (error) {
        throw new BadRequestException(stderr);
      }
    });

    return {
      message: 'Ping sent to target',
    };
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
          if (res) {
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
          }
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

  decryptToken(base64Payload: string) {
    const keyStr = 'RAINBOW_GITHUB_API_TOKEN';
    const key = crypto.createHash('sha256').update(keyStr).digest();

    const payloadBuffer = Buffer.from(base64Payload, 'base64');
    const iv = payloadBuffer.slice(0, 16); // 앞 16바이트가 IV
    const encrypted = payloadBuffer.slice(16); // 나머지는 암호문

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * 릴리즈 앱 버전 조회
   * @param token encrypted Token
   * @param base64IV base64 encoded IV
   * @param branch 브랜치 이름
   * @param software 소프트웨어 이름
   * @returns 릴리즈 앱 버전 정보
   */
  async getReleaseAppsVersionList({
    token,
    branch = 'main',
    software,
  }: GetReleaseAppsVersionListDto) {
    try {
      let convertSoftware = '';

      if (software === 'slamnav2') {
        convertSoftware = 'slamnav2';
      } else if (software === 'rrs') {
        convertSoftware = 'web_robot_server';
      } else if (software === 'web-rainbow-ui') {
        convertSoftware = 'web-ui';
      } else {
        throw new BadRequestException({
          message: '소프트웨어 이름이 올바르지 않습니다.',
        });
      }

      const url = `https://api.github.com/repos/rainbow-mobile/rainbow-release-apps/contents/${convertSoftware}?ref=${branch}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Basic ${this.decryptToken(token)}`,
        },
        method: 'GET',
      });

      return res.json();
    } catch (error) {
      throw new BadRequestException({
        message: error.message,
      });
    }
  }

  /**
   * 릴리즈 앱 브랜치 조회
   * @param token Github Token
   * @param per_page 한 페이지에 보여지는 브랜치 개수
   * @param page 페이지 번호
   * @returns 릴리즈 앱 브랜치 정보
   */
  async getReleaseAppsBranches({
    token,
    per_page,
    page,
  }: GetReleaseAppsBranchesDto) {
    try {
      const url = `https://api.github.com/repos/rainbow-mobile/rainbow-release-apps/branches?per_page=${per_page}&page=${page}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Basic ${this.decryptToken(token)}`,
        },
      });

      return res.json();
    } catch (error) {
      throw new BadRequestException({
        message: error.message,
      });
    }
  }

  /**
   * 웹 UI 앱 추가
   * @param appNames 앱 이름 배열
   * @param branch 브랜치 이름
   * @param fo 프로젝트 이름
   * @returns 앱 추가 요청 결과
   */
  async webUIAppAdd({ appNames, branch, fo }: WebUIAppAddDto) {
    const appAddScript = path.join(
      homedir(),
      `rainbow-deploy-kit/web-ui`,
      'fe-add-app.sh',
    );

    const rainbowDeployKitDir = path.join(homedir(), 'rainbow-deploy-kit');

    if (!fs.existsSync(appAddScript)) {
      throw new NotFoundException({
        message: `~/rainbow-deploy-kit/web-ui/fe-add-app.sh 파일을 찾을 수 없습니다.`,
      });
    }

    try {
      execSync('git pull', {
        cwd: rainbowDeployKitDir,
        stdio: 'pipe',
      });

      execSync(
        `bash ${appAddScript}${branch ? ` --mode=${branch}` : ''}${fo ? ` --fo=${fo}` : ''} ${appNames.join(' ')}`,
      );

      return { appNames, branch, fo };
    } catch (error) {
      throw new BadRequestException({
        message: error.message,
      });
    }
  }

  /**
   * 웹 UI 앱 삭제
   * @param appNames 앱 이름 배열
   * @returns 앱 삭제 요청 결과
   */
  async webUIAppDelete({ appNames }: WebUIAppDeleteDto) {
    const appDeleteScript = path.join(
      homedir(),
      `rainbow-deploy-kit/web-ui`,
      'fe-delete-app.sh',
    );

    const rainbowDeployKitDir = path.join(homedir(), 'rainbow-deploy-kit');

    if (!fs.existsSync(appDeleteScript)) {
      throw new NotFoundException({
        message: `~/rainbow-deploy-kit/web-ui/fe-delete-app.sh 파일을 찾을 수 없습니다.`,
      });
    }

    try {
      execSync('git pull', {
        cwd: rainbowDeployKitDir,
        stdio: 'pipe',
      });

      execSync(`bash ${appDeleteScript} ${appNames.join(' ')}`);

      return { appNames };
    } catch (error) {
      throw new BadRequestException({
        message: error.message,
      });
    }
  }
}
