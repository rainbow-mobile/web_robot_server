import { SocketGateway } from '@sockets/gateway/sockets.gateway';
export declare class MapService {
    private readonly socketGateway;
    constructor(socketGateway: SocketGateway);
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
