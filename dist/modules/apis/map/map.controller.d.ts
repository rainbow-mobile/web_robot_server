import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { Response } from 'express';
import { GoalReadDto } from './dto/goal.read.dto';
import { ConfigService } from '@nestjs/config';
export declare class MapController {
    private readonly socketGateway;
    private readonly configService;
    constructor(socketGateway: SocketGateway, configService: ConfigService);
    private readonly mapService;
    getList(res: Response): Promise<Response<any, Record<string, any>>>;
    getCurrentMapName(res: Response): Promise<Response<any, Record<string, any>>>;
    loadMap(mapNm: string, res: Response): Promise<Response<any, Record<string, any>>>;
    getCloud(mapNm: string, res: Response): Promise<Response<any, Record<string, any>>>;
    saveCloud(mapNm: string, data: any[], res: Response): Promise<Response<any, Record<string, any>>>;
    getTilesExist(mapNm: string): Promise<boolean>;
    getTiles(mapNm: string, z: string, y: string, x: string, res: Response): Promise<Response<any, Record<string, any>>>;
    getTopology(mapNm: string, res: Response): Promise<Response<any, Record<string, any>>>;
    saveTopology(mapNm: string, data: JSON, res: Response): Promise<Response<any, Record<string, any>>>;
    getNodes(mapNm: string, param: GoalReadDto, res: Response): Promise<Response<any, Record<string, any>>>;
    getGoals(mapNm: string, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteMap(mapNm: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
