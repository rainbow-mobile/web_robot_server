import httpLogger from '@common/logger/http.logger';
import { HttpStatus, Injectable } from '@nestjs/common';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';

@Injectable()
export class MoveService {
    constructor(private readonly socketGateway: SocketGateway){}

    async moveCommand(data:{}) {
        return new Promise((resolve, reject) => {
        if (this.socketGateway.slamnav != null) {
            this.socketGateway.server.to('slamnav').emit("move",data);
            httpLogger.info("emit Slamnav : move");
    
            this.socketGateway.slamnav.once("moveResponse", (data) => {
                httpLogger.info("emit Slamnav Success : " + data.result);
                resolve(data);
                clearTimeout(timeoutId);
            });
            
            this.socketGateway.slamnav.once("move", (data) => {
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

    async moveJog(data:{}) {
        if (this.socketGateway.slamnav != null) {
            this.socketGateway.server.to('slamnav').emit("move",data);
        }
    }

    
    
  
}
