import { OnModuleInit } from '@nestjs/common';
import { Server } from 'socket.io';
import * as ssh2 from 'ssh2';
export declare class SSHGateway implements OnModuleInit {
    server: Server;
    clients: Map<string, any>;
    connection: {
        [key: string]: ssh2.Client;
    };
    shell: {
        [key: string]: ssh2.Client;
    };
    stream: {
        [key: string]: NodeJS.ReadableStream;
    };
    conectado: {
        [key: string]: boolean;
    };
    onModuleInit(): void;
    handleConnection(socket: any): void;
    handleMessage(socket: any, message: string): void;
    handleAuth(socket: any, authData: any): void;
    handleShellData(socket: any, data: string): void;
    handleDisconnect(socket: any): void;
}
