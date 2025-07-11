import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { Response } from 'express';
export declare class ProcessController {
    private readonly socketGateway;
    constructor(socketGateway: SocketGateway);
    private readonly processService;
    getConnection(res: Response): Promise<Response<any, Record<string, any>>>;
}
