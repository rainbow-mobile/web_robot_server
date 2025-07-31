import { ConfigService } from '@nestjs/config';
export declare class UploadService {
    private readonly configService;
    private dataBasePath;
    constructor(configService: ConfigService);
    private storage;
    private upload;
    downloadMap(fileName: string): Promise<unknown>;
    zipFolder(sourceFolderPath: string, zipFilePath: string): Promise<unknown>;
    unzipFolder(zipFilePath: string, extractToPath: string): Promise<unknown>;
}
