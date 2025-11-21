export declare enum ConfigCommand {
    getDriveParam = "getDriveParam",
    getParam = "getParam",
    setParam = "setParam"
}
export declare enum ConfigParameterType {
    float = "float",
    string = "string",
    boolean = "boolean",
    int = "int"
}
export declare enum Result {
    accept = "accept",
    reject = "reject",
    fail = "fail",
    success = "success"
}
export declare class ConfigParameterDto {
    name: string;
    type: string;
    value: string;
}
export declare class ConfigRequestDto {
    parameters?: ConfigParameterDto[];
}
export declare class ConfigResponseDto extends ConfigRequestDto {
    result: string;
    message?: string;
}
