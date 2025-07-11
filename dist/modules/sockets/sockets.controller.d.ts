import { OnModuleInit } from '@nestjs/common';
import { SocketGateway } from './gateway/sockets.gateway';
import { VariablesService } from '../apis/variables/variables.service';
import { Response } from 'express';
import { FrsUrlDto } from './dto/frs.url.dto';
import { EmitOnOffDto } from './dto/lidar.onoff.dto';
import { VariableDto } from '../apis/variables/dto/variables.dto';
import { AlarmDto } from './dto/alarm.dto';
import { SequenceDto } from './dto/sequence.dto';
export declare class SocketsController implements OnModuleInit {
    private readonly socketGateway;
    private readonly variableService;
    constructor(socketGateway: SocketGateway, variableService: VariablesService);
    onModuleInit(): void;
    getVariable(): Promise<void>;
    conSocket(): Promise<void>;
    getFrsUrl(res: Response): Promise<Response<any, Record<string, any>>>;
    updateFrsUrl(data: FrsUrlDto, res: Response): Promise<Response<any, Record<string, any>>>;
    updateFrsUrlTest(data: FrsUrlDto, res: Response): Promise<Response<any, Record<string, any>>>;
    getFrsInfo(res: Response): Promise<Response<any, Record<string, any>>>;
    getStatus(res: Response): Promise<void>;
    lidarOn(data: EmitOnOffDto, res: Response): Promise<void>;
    pathOn(data: EmitOnOffDto, res: Response): Promise<void>;
    setRobotSerial(data: VariableDto, res: Response): Promise<Response<any, Record<string, any>>>;
    setDebugMode(onoff: string, res: Response): Promise<Response<any, Record<string, any>>>;
    setAlarm(data: AlarmDto): Promise<void>;
    sequenceManipulator(scope: string, data: SequenceDto): Promise<void>;
}
