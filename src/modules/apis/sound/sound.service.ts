import httpLogger from '@common/logger/http.logger';
import { HttpStatus, Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import * as playSound from 'play-sound';
import * as fs from 'fs';
import { errorToJson } from '@common/util/error.util';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';

@Injectable()
export class SoundService {
    private player = playSound();
    private curPlay;

    async play(body){
        return new Promise(async (resolve, reject) => {
            try{
                const path = "/home/rainbow/sounds/"+body.fileNm;
                httpLogger.info(`[SOUND] Play: ${path}`)
                if(fs.existsSync(path)){
                    this.curPlay = this.player.play(path,{ mplayer: ['-volume', body.volume] }, (err) => {
                        if (err) {
                            httpLogger.error(`[SOUND] Play: ${JSON.stringify(err)}`);
                            reject({status:HttpStatus.BAD_REQUEST,data:{message:err}});
                        } else {
                            httpLogger.info(`[SOUND] Play: Done (${path})}`)
                            resolve(path);
                        }
                    });
                    if(!body.waitDone){
                        httpLogger.info(`[SOUND] Play: Start (waitDone false)}`)
                        resolve(path);
                    }
                }else{
                    reject({status:HttpStatus.BAD_REQUEST,data:{message:'file not found'}});
                }
            }catch(error){
                reject({status:HttpStatus.INTERNAL_SERVER_ERROR,data:{message:HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,code:error}});
            }
        });
    }

    async playLoop(body){
        return new Promise(async (resolve, reject) => {
            try{
                const path = "/home/rainbow/sounds/"+body.fileNm;
                httpLogger.info(`[SOUND] Play: ${path}`)
                if(fs.existsSync(path)){
                    this.curPlay = this.player.play(path,{ mplayer: ['-volume', body.volume] }, (err) => {
                        if (err) {
                            httpLogger.error(`[SOUND] Play: ${JSON.stringify(err)}`);
                            reject({status:HttpStatus.BAD_REQUEST,data:{message:err}});
                        } else {
                            httpLogger.info(`[SOUND] Play: Done (${path})}`)
                            this.playLoop(body);
                        }
                    });
                    resolve(path);
                }else{
                    reject({status:HttpStatus.BAD_REQUEST,data:{message:'file not found'}});
                }
            }catch(error){
                reject({status:HttpStatus.INTERNAL_SERVER_ERROR,data:{message:HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,code:error}});
            }
        });
    }

    async stop(){
        try{
            this.curPlay?.kill();
        }catch(error){
            httpLogger.error(`[SOUND] Stop: ${errorToJson(error)}`)
        }
    }

    async getList(path: string): Promise<any[]> {
        try {
        const files = await fs.promises.readdir(path, { withFileTypes: true });
        let list = [];

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
