import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { ConfigService } from '@nestjs/config';
export declare class MapService {
    private readonly socketGateway;
    private readonly configService;
    constructor(socketGateway: SocketGateway, configService: ConfigService);
    private mapDir;
    getMapList(): Promise<any>;
    parseMapList(dir: string, father?: {
        list: any[];
    }): Promise<{
        list: any[];
    }>;
    readCloud(mapNm: string): Promise<unknown>;
    saveCloud(mapNm: string, data: any[]): Promise<unknown>;
    readTopology(mapNm: string): Promise<any[]>;
    saveTopology(mapNm: string, data: JSON): Promise<unknown>;
    loadMap(mapNm: string): Promise<unknown>;
}
