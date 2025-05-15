export declare class UploadService {
    private storage;
    private upload;
    downloadMap(fileName: string): Promise<unknown>;
    zipFolder(sourceFolderPath: string, zipFilePath: string): Promise<unknown>;
    unzipFolder(zipFilePath: string, extractToPath: string): Promise<unknown>;
}
