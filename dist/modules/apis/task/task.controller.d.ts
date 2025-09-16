import { Response } from 'express';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { TaskSaveDto } from './dto/task.save.dto';
import { ConfigService } from '@nestjs/config';
export declare class TaskController {
    private readonly socketGateway;
    private readonly configService;
    private dataBasePath;
    constructor(socketGateway: SocketGateway, configService: ConfigService);
    private readonly taskService;
    getTaskFile(res: Response): Promise<Response<any, Record<string, any>>>;
    getTaskInfo(res: Response): Promise<Response<any, Record<string, any>>>;
    loadTask(mapName: string, taskName: string, res: Response): Promise<Response<any, Record<string, any>>>;
    runTask(res: Response): Promise<Response<any, Record<string, any>>>;
    stopTask(res: Response): Promise<Response<any, Record<string, any>>>;
    readTaskList(mapName: string, res: Response): Promise<Response<any, Record<string, any>>>;
    readTask(mapName: string, taskName: string, res: Response): Promise<Response<any, Record<string, any>>>;
    saveTask(data: TaskSaveDto, mapName: string, taskName: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
