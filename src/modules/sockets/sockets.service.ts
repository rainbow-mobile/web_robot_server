import { Injectable } from "@nestjs/common";
import { SocketGateway } from "./gateway/sockets.gateway";
import { LogService } from "../apis/log/log.service";

@Injectable()
export class SocketService {
    constructor(private readonly socketGateway: SocketGateway, private readonly logService: LogService) {}

    private saver = setInterval(() => {
        if(this.socketGateway.slamnav){
          this.logService.emitState(this.socketGateway.robotState);
          this.logService.emitPower(this.socketGateway.robotState);
          this.logService.emitStatus(this.socketGateway.robotState, this.socketGateway.slamnav?true:false, this.socketGateway.taskState);
          this.logService.readMemoryUsage();
        }
    }, 10000);

}