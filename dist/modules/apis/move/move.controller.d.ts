import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { Response } from 'express';
import { MoveCommandDto } from 'src/modules/apis/move/dto/move.command.dto';
export declare class MoveController {
    private readonly socketGateway;
    constructor(socketGateway: SocketGateway);
    private readonly moveService;
    moveControl(data: MoveCommandDto, res: Response): Promise<Response<any, Record<string, any>>>;
    moveStop(res: Response): Promise<Response<any, Record<string, any>>>;
    movePause(res: Response): Promise<Response<any, Record<string, any>>>;
    moveResume(res: Response): Promise<Response<any, Record<string, any>>>;
}
