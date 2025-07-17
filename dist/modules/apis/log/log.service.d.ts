import { Repository } from 'typeorm';
import { StatusPayload } from '@common/interface/robot/status.interface';
import { DataSource } from 'typeorm';
import { StatusLogEntity } from './entity/status.entity';
import { TaskPayload } from '@common/interface/robot/task.interface';
import { LogReadDto } from './dto/log.read.dto';
import { PaginationResponse } from '@common/pagination/pagination.response';
import { NetworkUsagePayload, ProcessUsagePayload, SystemUsagePayload } from '@common/interface/system/usage.interface';
import { SystemLogEntity } from './entity/system.entity';
import { ConfigService } from '@nestjs/config';
export declare class LogService {
    private readonly statusRepository;
    private readonly systemRepository;
    private readonly dataSource;
    private readonly configService;
    constructor(statusRepository: Repository<StatusLogEntity>, systemRepository: Repository<SystemLogEntity>, dataSource: DataSource, configService: ConfigService);
    init(): Promise<void>;
    private systemUsage;
    private processUsage;
    private networkUsage;
    addDisconForGaps(filteredArray: {
        time: Date;
        value: any;
    }[]): Promise<{
        time: string;
        value: any;
    }[]>;
    getStatusParam(key: string): Promise<unknown>;
    getStatusLog(key: string): Promise<unknown>;
    readLogLines(filePath: string): Promise<string[]>;
    parseLines(line: string, param: any): Promise<{
        time: string;
        level: string;
        category: string;
        text: string;
    }>;
    getLogs(type: string, param: LogReadDto): Promise<PaginationResponse<any>>;
    getSystemProcess(param: LogReadDto): Promise<{
        time: Date;
        slamnav: ProcessUsagePayload;
        taskman: ProcessUsagePayload;
        server: ProcessUsagePayload;
        webui: ProcessUsagePayload;
    }[]>;
    getSystemCpu(param: LogReadDto): Promise<{
        time: Date;
        cpu: number;
        cpu_cores: number[];
        memory_free: number;
        memory_total: number;
    }[]>;
    getStatus(type: string, param: LogReadDto): Promise<PaginationResponse<any>>;
    readState(state: StatusPayload): Promise<"Charging" | "Power Off" | "Mapping" | "Not Ready" | "Obstacle" | "Moving" | "Paused" | "Ready" | "?">;
    handleArchiving(): Promise<void>;
    emitStatusTest(time: string): Promise<unknown>;
    emitStatus(state: StatusPayload, slam: boolean, task: TaskPayload): Promise<unknown>;
    checkTables(name: string, query: string): Promise<void>;
    archiveOldDataDay(): Promise<void>;
    getOldestTime(): Promise<Date>;
    archiveOldDBData(type: string, date: string): Promise<void>;
    archiveOldJSONData(type: string, date: string): Promise<void>;
    optimizeTable(tableName: string): Promise<void>;
    getCpuUsage(): Promise<SystemUsagePayload>;
    getProcessUsage(): Promise<Map<string, ProcessUsagePayload>>;
    private previousStats;
    private previousTime;
    getNetworkUsage(): Promise<Map<string, NetworkUsagePayload>>;
    emitSystem(): Promise<void>;
    getSystemCurrent(): Promise<{
        system: any;
        process: Map<string, any>;
        network: any;
    }>;
    readMemoryUsage(): Promise<void>;
}
