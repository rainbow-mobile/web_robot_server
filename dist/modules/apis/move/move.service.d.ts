import { SocketGateway } from '@sockets/gateway/sockets.gateway';
export declare class MoveService {
    private readonly socketGateway;
    constructor(socketGateway: SocketGateway);
    moveCommand(data: any): Promise<unknown>;
    moveJog(data: object): Promise<void>;
}
