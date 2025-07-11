import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { Response } from 'express';
import { LocalizationDto } from 'src/modules/apis/control/dto/localization.command.dto';
import { LedControlDto } from './dto/led.control.dto';
import { LidarControlDto } from './dto/lidar.control.dto';
import { MotorControlDto } from './dto/motor.control.dto';
import { ExternalCommandDto } from './dto/external.control.dto';
export declare class ControlController {
    private readonly socketGateway;
    constructor(socketGateway: SocketGateway);
    private readonly controlService;
    mappingStart(res: Response): Promise<void>;
    mappingStop(res: Response): Promise<void>;
    mappingSave(name: string, res: Response): Promise<Response<any, Record<string, any>>>;
    mappingReload(res: Response): Promise<void>;
    dockStart(res: Response): Promise<void>;
    dockStop(res: Response): Promise<void>;
    localization(data: LocalizationDto, res: Response): Promise<Response<any, Record<string, any>>>;
    ledControl(data: LedControlDto, res: Response): Promise<Response<any, Record<string, any>>>;
    lidarControl(data: LidarControlDto, res: Response): Promise<Response<any, Record<string, any>>>;
    pathControl(data: LidarControlDto, res: Response): Promise<Response<any, Record<string, any>>>;
    motorControl(data: MotorControlDto, res: Response): Promise<Response<any, Record<string, any>>>;
    randomSeqStart(res: Response): Promise<Response<any, Record<string, any>>>;
    externalCommand(request: ExternalCommandDto, res: Response): Promise<Response<any, Record<string, any>>>;
}
