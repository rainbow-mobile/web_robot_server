import { StatusPayload } from '@common/interface/robot/status.interface';
export declare class InfluxDBService {
    private client;
    private writeApi;
    private queryApi;
    private bucket;
    private org;
    private database;
    constructor();
    writeData(): Promise<void>;
    testStatus(time: string): Promise<void>;
    writeMoveStatus(status: StatusPayload): Promise<void>;
    writeStatus(status: StatusPayload): Promise<void>;
    queryData(database: string, table: string): Promise<unknown>;
}
