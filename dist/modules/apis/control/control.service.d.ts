import { SocketGateway } from '@sockets/gateway/sockets.gateway';
export declare class ControlService {
    private readonly socketGateway;
    constructor(socketGateway: SocketGateway);
    mappingCommand(data: {
        command: string;
        time: string;
        name?: string;
    }): Promise<unknown>;
    ledControl(data: {
        command: string;
        led: string;
    }): Promise<unknown>;
    sendCommand(topic: any, data: any): Promise<unknown>;
    dockCommand(data: {
        command: string;
        time: string;
    }): Promise<unknown>;
    Localization(data: {
        command: string;
        time: string;
        x?: string;
        y?: string;
        z?: string;
        rz?: string;
    }): Promise<unknown>;
}
