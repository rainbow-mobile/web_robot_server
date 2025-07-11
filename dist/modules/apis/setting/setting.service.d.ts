import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { PresetDto } from 'src/modules/apis/setting/dto/setting.preset.dto';
export declare class SettingService {
    private readonly socketGateway;
    constructor(socketGateway: SocketGateway);
    getSetting(type: string): Promise<any>;
    saveSetting(type: string, data: JSON): Promise<unknown>;
    convertNumbersToStrings(obj: Record<string, any>): Promise<Record<string, any>>;
    getPreset(type: string, id: string): Promise<any[]>;
    deletePreset(type: string, id: string): Promise<unknown>;
    makePreset(type: string, id: string): Promise<unknown>;
    savePreset(type: string, id: string, data: PresetDto): Promise<unknown>;
    getPresetList(type: string): Promise<unknown>;
    transformSettingToJson(data: any): Promise<any>;
    transformSettingToFile(data: any): Promise<any>;
    mergeArrayByKey(oldArray: any, newArray: any, key: any): Promise<any[]>;
    deepMerge(oldData: any, newData: any): Promise<any>;
}
