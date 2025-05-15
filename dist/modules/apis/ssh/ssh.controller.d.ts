import { Response } from 'express';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { CommandDto } from './dto/command.dto';
export declare class SSHController {
    private readonly socketGateway;
    constructor(socketGateway: SocketGateway);
    private readonly taskService;
    private conn;
    sshConnect(host: string, res: Response): Promise<void>;
    sshCommand(host: string, data: CommandDto, res: Response): Promise<void>;
}
