import httpLogger from '@common/logger/http.logger';
import { HttpStatus, Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as playSound from 'play-sound';
import * as fs from 'fs';
import * as os from 'os';
import { errorToJson } from '@common/util/error.util';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import { SoundPlayDto } from './dto/sound.play.dto';

@Injectable()
export class SoundService {
  private player = playSound();
  private curPlay: any = null;
  private isLooping: boolean = false;

  async play(body: SoundPlayDto) {
    return new Promise(async (resolve, reject) => {
      try {
        // 기존 재생 중인 음악이 있으면 먼저 정지
        if (this.curPlay) {
          httpLogger.info(
            `[SOUND] Play spawnargs FileName: ${this.curPlay.spawnargs?.[1]}`,
          );
          httpLogger.info(`[SOUND] Play Body FileNamess: ${path}`);

          if (this.curPlay.spawnargs?.[1] === path) {
            reject({
              status: HttpStatus.BAD_REQUEST,
              data: { message: 'Sound is already playing' },
            });
            return;
          } else {
            await this.stop();
          }
        }

        const path = './public/sound/' + body.fileNm;

        if (fs.existsSync(path)) {
          this.curPlay = this.player.play(
            path,
            { mplayer: ['-ao', 'pulse', '-volume', body.volume] },
            (err) => {
              if (err) {
                httpLogger.error(`[SOUND] Play: ${JSON.stringify(err)}`);
                reject({
                  status: HttpStatus.BAD_REQUEST,
                  data: { message: err },
                });
              } else {
                httpLogger.info(`[SOUND] Play: Done (${path})}`);
                resolve(path);
              }
            },
          );

          if (!body.waitDone) {
            httpLogger.info(`[SOUND] Play: Start (waitDone false)}`);
            resolve(path);
          }
        } else {
          reject({
            status: HttpStatus.BAD_REQUEST,
            data: { message: 'file not found' },
          });
        }
      } catch (error) {
        reject({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          data: {
            message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
            code: error,
          },
        });
      }
    });
  }

  async playLoop(body: SoundPlayDto) {
    return new Promise(async (resolve, reject) => {
      try {
        const path = './public/sound/' + body.fileNm;

        if (this.curPlay) {
          httpLogger.info(
            `[SOUND] Play spawnargs FileName: ${this.curPlay.spawnargs?.[1]}`,
          );
          httpLogger.info(`[SOUND] Play Body FileNamess: ${path}`);

          if (this.curPlay.spawnargs?.[1] === path) {
            reject({
              status: HttpStatus.BAD_REQUEST,
              data: { message: 'Sound is already playing' },
            });
            return;
          } else {
            await this.stop();
          }
        }

        if (fs.existsSync(path)) {
          this.isLooping = true;

          const playNext = () => {
            if (!this.isLooping) return;

            this.curPlay = this.player.play(
              path,
              { mplayer: ['-ao', 'pulse', '-volume', body.volume] },
              (err) => {
                if (err) {
                  httpLogger.error(`[SOUND] PlayLoop: ${JSON.stringify(err)}`);
                  this.isLooping = false;
                  reject({
                    status: HttpStatus.BAD_REQUEST,
                    data: { message: err },
                  });
                } else {
                  httpLogger.info(`[SOUND] PlayLoop: Done (${path})}`);
                  // 루프가 활성화되어 있으면 다시 재생
                  if (this.isLooping) {
                    playNext();
                  }
                }
              },
            );
          };

          playNext();
          resolve(path);
        } else {
          reject({
            status: HttpStatus.BAD_REQUEST,
            data: { message: 'file not found' },
          });
        }
      } catch (error) {
        reject({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          data: {
            message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
            code: error,
          },
        });
      }
    });
  }

  async stop() {
    const platform = os.platform();
    this.isLooping = false;

    if (this.curPlay) {
      this.curPlay.kill();
      this.curPlay = null;
    }

    const killCommand =
      platform === 'linux' || platform === 'darwin'
        ? 'pkill -f mplayer'
        : platform === 'win32'
          ? 'taskkill /IM mplayer.exe /F'
          : '';

    if (killCommand) {
      await new Promise<void>((resolve) => {
        exec(killCommand, () => resolve());
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 200));

    return 'Sound stopped';
  }

  async getList(path: string): Promise<any[]> {
    try {
      const files = await fs.promises.readdir(path, { withFileTypes: true });
      const list = [];

      files.map((file) => {
        if (file.name.split('.').length > 1) {
          list.push(file.name);
        }
      });
      return list;
    } catch (e) {
      httpLogger.error(`[SOUND] getList: ${errorToJson(e)}`);
    }
  }
}
