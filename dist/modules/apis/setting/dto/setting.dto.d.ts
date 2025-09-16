export declare enum SettingCommand {
    getSetting = "getSetting",
    saveSetting = "saveSetting",
    saveSettingAll = "saveSettingAll",
    getPresetList = "getPresetList",
    getPreset = "getPreset",
    deletePreset = "deletePreset",
    createPreset = "createPreset",
    savePreset = "savePreset",
    getParam = "getParam",
    setParam = "setParam",
    getDriveParam = "getDriveParam"
}
export declare class SettingParam {
    name?: string;
    value?: string;
    type?: string;
}
export declare class SettingRequestDto {
    preset?: string;
    param?: SettingParam[];
}
export declare class SettingResponseDto extends SettingRequestDto {
    list?: string[];
}
export declare class SettingRequestSlamnav extends SettingRequestDto {
    id: string;
    command: string;
}
export declare class SettingResponseSlamnav extends SettingResponseDto {
    id: string;
    command: string;
    result: string;
    message?: string;
}
export declare class SettingGetSettingRequestDto {
}
export declare class SettingGetSettingResponseDto extends SettingGetSettingRequestDto {
    param: SettingParam[];
}
export declare class SettingSaveSettingRequestDto extends SettingGetSettingRequestDto {
    param: SettingParam[];
}
export declare class SettingSaveSettingResponseDto extends SettingSaveSettingRequestDto {
}
export declare class SettingSaveSettingAllRequestDto extends SettingGetSettingRequestDto {
    param: SettingParam[];
}
export declare class SettingSaveSettingAllResponseDto extends SettingSaveSettingAllRequestDto {
}
export declare class SettingGetPresetListRequestDto extends SettingGetSettingRequestDto {
}
export declare class SettingGetPresetListResponseDto extends SettingGetPresetListRequestDto {
    list: string[];
}
export declare class SettingGetPresetRequestDto extends SettingGetSettingRequestDto {
    preset: string;
}
export declare class SettingGetPresetResponseDto extends SettingGetPresetRequestDto {
    param: SettingParam[];
}
export declare class SettingCreatePresetRequestDto extends SettingGetPresetRequestDto {
}
export declare class SettingCreatePresetResponseDto extends SettingCreatePresetRequestDto {
    data: SettingParam[];
}
export declare class SettingDeletePresetRequestDto extends SettingGetPresetRequestDto {
}
export declare class SettingDeletePresetResponseDto extends SettingDeletePresetRequestDto {
}
export declare class SettingSavePresetRequestDto extends SettingGetPresetRequestDto {
    param: SettingParam[];
}
export declare class SettingSavePresetResponseDto extends SettingSavePresetRequestDto {
}
export declare class SettingSetParamRequestDto {
    param: SettingParam[];
}
export declare class SettingSetParamResponseDto extends SettingSetParamRequestDto {
}
