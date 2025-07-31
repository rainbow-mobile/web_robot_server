import { UpdateService } from './update.service';
import { ReqUpdateSoftwareDto, WebUIAppAddDto, WebUIAppDeleteDto } from './dto/update.update.dto';
import { GetNewVersionDto, GetReleaseAppsBranchesDto, GetReleaseAppsVersionListDto, PingSendToTargetDto } from './dto/update.get.dto';
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
    getReleaseAppsBranches(params: GetReleaseAppsBranchesDto): Promise<any>;
    getReleaseAppsVersionList(params: GetReleaseAppsVersionListDto): Promise<any>;
    webUIAppAdd(webUIAppAddDto: WebUIAppAddDto): Promise<{
        appNames: string[];
        branch: string;
        fo: string;
    }>;
    webUIAppDelete(webUIAppDeleteDto: WebUIAppDeleteDto): Promise<{
        appNames: string[];
    }>;
}
