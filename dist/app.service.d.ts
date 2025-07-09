import { OnApplicationShutdown } from '@nestjs/common';
import { LogService } from './modules/apis/log/log.service';
export declare class AppService implements OnApplicationShutdown {
    private readonly logService;
    constructor(logService: LogService);
    onApplicationShutdown(signal?: string): void;
}
