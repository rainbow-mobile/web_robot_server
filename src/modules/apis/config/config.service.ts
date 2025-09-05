import httpLogger from "@common/logger/http.logger";
import { HttpStatus, Injectable } from "@nestjs/common";
import { SocketGateway } from "@sockets/gateway/sockets.gateway";
import { ConfigRequestDto } from "./dto/config.dto";
import { ConfigRequestSlamnav } from "@sockets/dto/config.dto";

@Injectable()
export class ConfigService {
    constructor(private readonly socketGateway: SocketGateway) {}

    async configRequest(data: ConfigRequestSlamnav) {
        return new Promise((resolve, reject) => {
            if(this.socketGateway.slamnav != null){
                this.socketGateway.server.to('slamnav').emit('configRequest', data);
                httpLogger.info(`[CONFIG] configRequest: ${JSON.stringify(data)}`);
        
                this.socketGateway.slamnav.once('configResponse', (data2) => {
                  httpLogger.info(
                    `[CONFIG] configResponse: ${JSON.stringify(data2)}`,
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
}