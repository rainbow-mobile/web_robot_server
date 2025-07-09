import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { MotionCommandDto } from './dto/motion.dto';
export declare class MotionController {
    private readonly socketGateway;
    constructor(socketGateway: SocketGateway);
    private readonly motionService;
    move(data: MotionCommandDto): Promise<unknown>;
}
