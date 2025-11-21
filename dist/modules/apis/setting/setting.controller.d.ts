import { Response } from 'express';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { PresetDto } from 'src/modules/apis/setting/dto/setting.preset.dto';
import { CameraOrderChangeDto } from './dto/setting.camera.dto';
import { SettingSetParamRequestDto } from './dto/setting.dto';
export declare class SettingController {
    private readonly settingSsocketGatewayervice;
    constructor(settingSsocketGatewayervice: SocketGateway);
    private readonly settingService;
    generateId(): string;
    getPduParameter(): Promise<import("./dto/setting.dto").SettingResponseDto>;
    getDriveConfig(): Promise<import("./dto/setting.dto").SettingResponseDto>;
    setPduParameter(dto: SettingSetParamRequestDto): Promise<import("./dto/setting.dto").SettingResponseDto>;
    getSetting(type: string, res: Response): Promise<Response<any, Record<string, any>>>;
    saveSetting(type: string, data: JSON, res: Response): Promise<Response<any, Record<string, any>>>;
    getPresetList(type: string, res: Response): Promise<Response<any, Record<string, any>>>;
    makePreset(type: string, id: string, res: Response): Promise<Response<any, Record<string, any>>>;
    getPreset(type: string, id: string, res: Response): Promise<Response<any, Record<string, any>>>;
    savePreset(type: string, id: string, data: PresetDto, res: Response): Promise<Response<any, Record<string, any>>>;
    deletePreset(type: string, id: string, res: Response): Promise<Response<any, Record<string, any>>>;
    getCameraInfo(): Promise<unknown>;
    orderChange(data: CameraOrderChangeDto): Promise<unknown>;
}
