export interface ProcessUsagePayload {
    cpu:number;
    mem:number;
    vsz:number;
    rss:number;
    time:string;
}

export interface SystemUsagePayload {
    total_memory:number;
    free_memory:number;
    cpu:number;
    cpu_cores:number[];
}

export interface NetworkUsagePayload {
    rxKbps:number;
    txKbps:number;
    rxKBytes:number;
    txKBytes:number;
    rxPackets:number;
    txPackets:number;
    rxDrops:number;
    txDrops:number;
    rxErrors:number;
    txErrors:number;
}