import { ReqUpdateSoftwareDto } from './dto/update.update.dto';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
export declare class UpdateService {
    private readonly socketGateway;
    constructor(socketGateway: SocketGateway);
    checkRepositoryAccess(): Promise<true>;
    pingSendToTarget(target: string): {
        message: string;
    };
    updateSoftware({ software, branch, version }: ReqUpdateSoftwareDto): Promise<unknown> | {
        applyReqUpdate: boolean;
        version: string;
        rejectReason: string;
    };
    rrsUpdate({ branch, version }?: {
        branch?: string;
        version?: string;
    }): {
        applyReqUpdate: boolean;
        version: string;
        rejectReason: string;
    };
    otherSwUpdate({ branch, version, }?: {
        branch?: string;
        version?: string;
    }): Promise<unknown>;
    getCurrentVersion(software: string): Promise<any>;
    getRrsCurrentVersion(): Promise<any>;
    getOtherSwCurrentVersion(data?: {
        software?: string;
    }): Promise<unknown>;
    getNewVersion({ software, branch, }: {
        software: string;
        branch: string;
    }): Promise<any>;
}
