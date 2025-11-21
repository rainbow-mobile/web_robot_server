import { ConfigService } from '@nestjs/config';
export declare class ProcessService {
    private readonly configService;
    constructor(configService: ConfigService);
    getRobotInfo(): Promise<any>;
    writeRobotInfo(body: any): Promise<{
        robotInfo: any;
    }>;
    updateRobotInfo(body: any): Promise<{
        robotInfo: any;
    }>;
    deleteRobotInfoData(body: {
        section: string;
        key: string;
    }): Promise<{
        robotInfo: any;
    }>;
}
