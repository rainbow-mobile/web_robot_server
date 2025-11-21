import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { MotionCommandDto } from './dto/motion.dto';
export declare class MotionService {
    private readonly socketGateway;
    constructor(socketGateway: SocketGateway);
    motionCommand(data: MotionCommandDto): Promise<unknown>;
}
