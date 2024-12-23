import { Injectable } from "@nestjs/common";
import { SocketGateway } from "./gateway/sockets.gateway";
import { LogService } from "../apis/log/log.service";

@Injectable()
export class SocketService {
    constructor(private readonly socketGateway: SocketGateway, private readonly logService: LogService) {}

    private saver = setInterval(() => {
        if(this.socketGateway.slamnav){
            console.log("emitState")
          this.logService.emitState(this.socketGateway.robotState);
          this.logService.emitPower(this.socketGateway.robotState);
        }
    }, 10000);

}