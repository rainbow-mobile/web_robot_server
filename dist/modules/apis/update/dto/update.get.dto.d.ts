export declare class GetSoftwareParamDto {
    software: string;
}
export declare class GetNewVersionDto {
    branch?: string;
}
export declare class PingSendToTargetDto {
    target: string;
}
export declare class GetReleaseAppsBranchesDto {
    token: string;
    per_page?: number | string;
    page?: number | string;
}
export declare class GetReleaseAppsVersionListDto {
    token: string;
    branch?: string;
    software: string;
}
export declare class CommitDto {
    sha: string;
    url: string;
    name: string;
    protected: boolean;
}
export declare class ResponseReleaseAppsBranchesDto {
    commit: CommitDto;
    name: string;
    protected: boolean;
}
export declare class ResponseReleaseVersionInfoDto {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    download_url: string;
    _links: {
        self: string;
        html: string;
        git: string;
    };
}
