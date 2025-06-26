import { UploadService } from './upload.service';
import { Response, Request } from 'express';
import { UploadMapDto } from './dto/upload.map.dto';
import { DownloadMapDto } from './dto/download.map.dto';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadMap(data: UploadMapDto, res: Response): Promise<void>;
}
export declare class DownloadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    downloadMap(data: DownloadMapDto, res: Response): Promise<void>;
}
export declare class PublishController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    publishedMap(req: Request, mapNm: string, res: Response): Promise<void>;
}
