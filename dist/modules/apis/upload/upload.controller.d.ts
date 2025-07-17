import { UploadService } from './upload.service';
import { Response, Request } from 'express';
import { UploadMapDto } from './dto/upload.map.dto';
import { DownloadMapDto } from './dto/download.map.dto';
import { ConfigService } from '@nestjs/config';
export declare class UploadController {
    private readonly uploadService;
    private readonly configService;
    private dataBasePath;
    constructor(uploadService: UploadService, configService: ConfigService);
    uploadMap(data: UploadMapDto, res: Response): Promise<void>;
}
export declare class DownloadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    downloadMap(data: DownloadMapDto, res: Response): Promise<void>;
}
export declare class PublishController {
    private readonly uploadService;
    private readonly configService;
    private dataBasePath;
    constructor(uploadService: UploadService, configService: ConfigService);
    publishedMap(req: Request, mapNm: string, res: Response): Promise<void>;
}
