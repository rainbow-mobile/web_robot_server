import { LogService } from './log.service';
import { Response } from 'express';
import { StatusTestDto } from './dto/status.dto';
import { LogReadDto } from './dto/log.read.dto';
export declare class LogController {
    private readonly logService;
    constructor(logService: LogService);
    getStatus(param: LogReadDto, res: Response): Promise<void>;
    getStatusParam(key: string, res: Response): Promise<void>;
    archiveStatus(res: Response): Promise<void>;
    emitTestStatus(data: StatusTestDto, res: Response): Promise<void>;
    getApiLog(param: LogReadDto, res: Response): Promise<void>;
    getSocketLog(param: LogReadDto, res: Response): Promise<void>;
    getSlamnavLog(param: LogReadDto, res: Response): Promise<void>;
    getSystemLog(param: LogReadDto, res: Response): Promise<void>;
    getSystemCpuLog(param: LogReadDto, res: Response): Promise<void>;
    getSystemProcessLog(param: LogReadDto, res: Response): Promise<void>;
    getSystemCurrent(res: Response): Promise<void>;
    getMemoryUsage(res: Response): Promise<void>;
    getLogValueKey(key: string, value: string, res: Response): Promise<void>;
    getLogKey(key: string, res: Response): Promise<void>;
}
