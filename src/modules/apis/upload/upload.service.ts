import { HttpStatus, Injectable } from '@nestjs/common';
import * as multer from 'multer';
import { homedir } from 'os';
import * as AdmZip from 'adm-zip';
import * as fs from 'fs';
import * as path from 'path';
import httpLogger from '@common/logger/http.logger';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import { errorToJson } from '@common/util/error.util';

@Injectable()
export class UploadService {
    private storage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, homedir() + "/upload/"); // 파일이 저장될 디렉토리
        },
        filename: (req, file, cb) => {
          cb(null, file.originalname); // 원본 파일 이름 그대로 저장
        },
    });

    private upload = multer({storage:this.storage})

    async zipFolder(sourceFolderPath:string, zipFilePath:string) {
        return new Promise((resolve, reject) => {
            try{
                const zip = new AdmZip();
              
                const addFilesRecursively = async(folderPath:string, zipFolderPath:string = "") => {
                  const files = fs.readdirSync(folderPath);
              
                  files.forEach((file) => {
                    const filePath = path.join(folderPath, file);
                    const stat = fs.statSync(filePath);
              
                    if (stat.isDirectory()) {
                      // 하위 폴더가 있다면 재귀적으로 처리
                      addFilesRecursively(filePath, path.join(zipFolderPath, file));
                    } else {
                      // 파일이라면 압축에 추가
                      zip.addLocalFile(filePath, zipFolderPath);
                    }
                  });
                }
              
                // 폴더 내 파일 및 하위 폴더를 재귀적으로 압축에 추가
                addFilesRecursively(sourceFolderPath);
              
                // 압축 파일 생성
                zip.writeZip(zipFilePath);
                httpLogger.info(`[UPLOAD] zipFolder: Done ${zipFilePath}`)
                resolve(zipFilePath);
            }catch(error){
              httpLogger.error(`[UPLOAD] zipFolder: ${sourceFolderPath}, ${zipFilePath}, ${errorToJson(error)}`)
                reject({status:HttpStatus.INTERNAL_SERVER_ERROR,data:{message:HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500}})
            }
        })
    }

    async unzipFolder(zipFilePath:string, extractToPath:string) {
        return new Promise((resolve, reject) => {
            try {
              httpLogger.info(`[UPLOAD] unzipFoler: ${zipFilePath}, ${extractToPath}`);
              const zip = new AdmZip(zipFilePath);
          
              // 압축 해제할 경로가 없다면 생성
              if (!fs.existsSync(extractToPath)) {
                fs.mkdirSync(extractToPath, { recursive: true });
              }
          
              // 압축 해제
              zip.extractAllTo(extractToPath, true); // true는 기존 파일 덮어쓰기를 의미
              httpLogger.info(`[UPLOAD] unzipFolder: Done ${extractToPath}`)
              resolve('');
            } catch (error) {
              httpLogger.error(`[UPLOAD] unzipFolder: ${zipFilePath}, ${extractToPath}, ${errorToJson(error)}`)
              reject({status:HttpStatus.INTERNAL_SERVER_ERROR,data:{message:HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500}})
            }
        });
    }
      
}
