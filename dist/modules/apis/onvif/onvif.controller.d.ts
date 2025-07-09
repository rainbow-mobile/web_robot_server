import { OnModuleInit } from '@nestjs/common';
import { Request, Response } from 'express';
import { OnvifDeviceService } from './onvif.service';
import { ConfigService } from '@nestjs/config';
export declare class OnvifDeviceController implements OnModuleInit {
    private readonly OnvifDeviceService;
    private readonly configService;
    constructor(OnvifDeviceService: OnvifDeviceService, configService: ConfigService);
    onModuleInit(): void;
    DeviceService(body: any, req: Request, res: Response): Promise<void>;
    MediaService(body: any, req: Request, res: Response): Promise<void>;
    getSnapshot(res: Response): Promise<void>;
    getSnapshot1(res: Response): Promise<void>;
    PTZService(body: any, req: Request, res: Response): Promise<void>;
    DeviceIOService(body: any, req: Request, res: Response): Promise<void>;
    EventService(body: any, req: Request, res: Response): Promise<void>;
}
