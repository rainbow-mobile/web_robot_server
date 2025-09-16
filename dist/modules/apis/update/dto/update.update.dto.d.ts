export declare class ReqUpdateSoftwareDto {
    software: string;
    branch: string;
    version?: string;
}
export declare class WebUIAppAddDto {
    appNames: string[];
    branch?: string;
    fo?: string;
}
export declare class WebUIAppDeleteDto {
    appNames: string[];
}
export declare class ResponseWebUIAppAddDto {
    appNames: string[];
    branch: string;
    fo: string;
}
export declare class ResponseWebUIAppDeleteDto {
    appNames: string[];
}
