import { Injectable } from "@nestjs/common";
import { SocketGateway } from "./gateway/sockets.gateway";
import { LogService } from "../apis/log/log.service";
import { InfluxDBService } from "../apis/influx/influx.service";

@Injectable()
export class SocketService {
    constructor(private readonly socketGateway: SocketGateway, private readonly logService: LogService){}//, private readonly influxService:InfluxDBService) {}

    private saver = setInterval(() => {
        if(this.socketGateway.slamnav){    
          this.logService.readMemoryUsage();
          this.logService.emitSystem();
          this.logService.emitStatus(this.socketGateway.robotState, this.socketGateway.slamnav?true:false, this.socketGateway.taskState);
          // this.influxService.writeStatus(this.socketGateway.robotState);
          // this.influxService.writeMoveStatus(this.socketGateway.robotState);
        }
    }, 10000);

}