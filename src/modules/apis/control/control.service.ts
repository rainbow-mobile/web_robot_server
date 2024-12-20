import httpLogger from '@common/logger/http.logger';
import { HttpStatus, Injectable } from '@nestjs/common';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';

@Injectable()
export class ControlService {
    constructor(private readonly socketGateway: SocketGateway){}

    async mappingCommand(data:{command:string, time:string, name?:string}) {
        return new Promise((resolve, reject) => {
        if (this.socketGateway.slamnav != null) {
            this.socketGateway.server.to('slamnav').emit("mapping",data);
            httpLogger.info("emit Slamnav : mapping "+data.command);
    
            this.socketGateway.slamnav.once("mapping", (data) => {
                httpLogger.info("emit Slamnav Success : " + data.result);
                resolve(data);
                clearTimeout(timeoutId);
            });
    
            const timeoutId = setTimeout(() => {
            reject({status:HttpStatus.GATEWAY_TIMEOUT,data:{message:"프로그램이 응답하지 않습니다"}});
            }, 5000); // 5초 타임아웃
        } else {
            reject({status:HttpStatus.GATEWAY_TIMEOUT,data:{message:"프로그램이 연결되지 않았습니다"}})
        }
        });
    }

    async Localization(data:{command:string, time:string, x?:string, y?:string, z?:string, rz?:string}) {
        return new Promise((resolve, reject) => {
        if (this.socketGateway.slamnav != null) {
            this.socketGateway.server.to('slamnav').emit("localization",data);
            httpLogger.info("emit Slamnav : Localization "+data.command);
    
            if(data.command == "start" || data.command == "stop"){
                httpLogger.info("emit Slamnav Success Auto : " + data.command);
                resolve({command : data.command, result: 'accept'})
            }else{
                this.socketGateway.slamnav.once("localization", (data) => {
                    httpLogger.info("emit Slamnav Success : " + data.result);
                    resolve(data);
                    clearTimeout(timeoutId);
                });
            }
    
            const timeoutId = setTimeout(() => {
            reject({status:HttpStatus.GATEWAY_TIMEOUT,data:{message:"프로그램이 응답하지 않습니다"}});
            }, 5000); // 5초 타임아웃
        } else {
            reject({status:HttpStatus.GATEWAY_TIMEOUT,data:{message:"프로그램이 연결되지 않았습니다"}})
        }
        });
    }
  
}
