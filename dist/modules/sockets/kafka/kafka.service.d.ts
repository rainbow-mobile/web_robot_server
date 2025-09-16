import { UploadService } from 'src/modules/apis/upload/upload.service';
export declare class KafkaClientService {
    private readonly uploadService;
    private kafka;
    private client;
    constructor(uploadService: UploadService);
    connect(): Promise<void>;
    mapPublish(data: any): Promise<void>;
}
