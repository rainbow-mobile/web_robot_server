import { Response } from 'express';
import { InfluxDBService } from './influx.service';
export declare class INFLUXController {
    private readonly influxService;
    constructor(influxService: InfluxDBService);
    test(time: string, res: Response): Promise<void>;
    sshConnect(res: Response): Promise<void>;
}
