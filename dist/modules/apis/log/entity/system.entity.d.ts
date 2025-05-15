import { ProcessUsagePayload } from "@common/interface/system/usage.interface";
export declare class SystemLogEntity {
    time: Date;
    cpu: number;
    cpu_cores: number[];
    memory_total: number;
    memory_free: number;
    network: any;
    server: ProcessUsagePayload;
    webui: ProcessUsagePayload;
    slamnav: ProcessUsagePayload;
    taskman: ProcessUsagePayload;
}
