import { UpdateService } from './update.service';
import { ReqUpdateSoftwareDto } from './dto/update.update.dto';
import { GetNewVersionDto, PingSendToTargetDto } from './dto/update.get.dto';
export declare class UpdateController {
    private readonly updateService;
    constructor(updateService: UpdateService);
    updateSoftware(reqUpdateSoftwareDto: ReqUpdateSoftwareDto): Promise<unknown> | {
        applyReqUpdate: boolean;
        version: string;
        rejectReason: string;
    };
    pingSendToTarget({ target }: PingSendToTargetDto): {
        message: string;
    };
    getNewVersion(software: string, { branch }: GetNewVersionDto): Promise<any>;
    getCurrentVersion(software: string): Promise<any>;
}
