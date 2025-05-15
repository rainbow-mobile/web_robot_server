import { SocketGateway } from "./gateway/sockets.gateway";
import { LogService } from "../apis/log/log.service";
export declare class SocketService {
    private readonly socketGateway;
    private readonly logService;
    constructor(socketGateway: SocketGateway, logService: LogService);
    private saver;
}
