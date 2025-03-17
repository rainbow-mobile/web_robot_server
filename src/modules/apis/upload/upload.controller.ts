import { Controller, Post, Res, Body, HttpStatus, Param, UseInterceptors, Req} from '@nestjs/common';
import { UploadService } from './upload.service';
import { Response, Request } from 'express';
import httpLogger from '@common/logger/http.logger';
import { UploadMapDto } from './dto/upload.map.dto';
import { ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import { homedir } from 'os';
import * as path from 'path';
const FormData = require("form-data");
import * as fs from 'fs';
import axios from 'axios';
import { DownloadMapDto } from './dto/download.map.dto';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import { uploadMiddleware } from '@middleware/upload.middleware';
import { errorToJson } from '@common/util/error.util';

@ApiTags('파일 전송 관련 API (Upload)')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('map')
  async uploadMap(@Body() data:UploadMapDto,@Res() res: Response){
    const originalFilePath = homedir() + "/maps/" + data.mapNm;
    const zipFileName = `${data.name}.zip`;
    const zipFilePath = path.join(homedir(), "maps", zipFileName);
    try{
      httpLogger.info(`[UPLOAD] uploadMap: ${JSON.stringify(data)}`)
      await this.uploadService.zipFolder(originalFilePath, zipFilePath);
      httpLogger.info(`[UPLOAD] uploadMap: zip Done`)

      // ZIP 파일 전송
      const zipStream = fs.createReadStream(zipFilePath);

      const formData = new FormData();
      formData.append("file", zipStream, { filename: zipFileName });
      formData.append("deleteZipAt", "Y");

      const config = {
        headers: {
          "content-type": "multipart/form-data; charset=utf-8",
          authorization: "Bearer " + data.token,
        },
      };
      httpLogger.info(`[UPLOAD] uploadMap: send FRS`)
      const response = await axios.post(
        global.frs_api + "/api/maps/frs-map/upload",
        formData,
        config
      );
      httpLogger.info(`[UPLOAD] uploadMap: send FRS Response: ${JSON.stringify(response.data)}`)
      res.send({ message: "파일 저장 성공" });
    }catch(error){
      httpLogger.error(`[UPLOAD] uploadMap: ${errorToJson(error)}`)
      res.status(error.status).send(error.data);
    }finally{
      fs.unlink(zipFilePath, (err) => {
        if (err) 
          httpLogger.error(`[UPLOAD] uploadMap: Delete ZipFile Failed...${errorToJson(err)}`)
      });
    }
  }

}

@ApiTags('파일 전송 관련 API (Download)')
@Controller('download')
export class DownloadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('map')
  async downloadMap(@Body() data: DownloadMapDto, @Res() res: Response){
    try {
        httpLogger.info(`[UPLOAD] DownloadMap: ${JSON.stringify(data)}`)
        await this.uploadService.downloadMap(data.name);
        res.status(HttpStatus.CREATED).send({message:HttpStatusMessagesConstants.MAP.SUCCESS_201});
    } catch (error) {
      httpLogger.error(`[UPLOAD] DownloadMap: Download Fail ${errorToJson(error.response.data)}`)
      res.status(error.response.status).send();
    }
  }
}

@ApiTags('파일 전송 관련 API (Publish)')
@Controller('publish')
export class PublishController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('map/:mapNm')
  async publishedMap(@Req() req: Request, @Param('mapNm') mapNm:string, @Res() res: Response){
    uploadMiddleware(req, res, async(err) => {
      if (err) {
        httpLogger.error(`[UPLOAD] PublishMap: ${errorToJson(err)}`)
        return res.status(400).send({ message: '파일 업로드 실패', error: err.message });
      }

      try{
        httpLogger.info(`[UPLOAD] PublishMap: Download Done`)
        const zipFilePath = path.join(homedir(), "upload", req.file.originalname);
  
        const extractToPath = path.join(homedir(), "maps", mapNm);
        httpLogger.info(`[UPLOAD] PublishMap: ${zipFilePath}, ${extractToPath}`)
  
        await this.uploadService.unzipFolder(zipFilePath, extractToPath);
  
        res.status(HttpStatus.CREATED).send({message:HttpStatusMessagesConstants.MAP.SUCCESS_201,
          filename: req.file.filename});  
      }catch(error){
        httpLogger.error(`[UPLOAD] PublishMap: ${mapNm}, ${req.file.originalname}, ${errorToJson(error)}`)
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500)
      }finally{
        fs.unlink(homedir() + "/upload/" + req.file.originalname, (err) => {
          if (err) 
            httpLogger.error(`[UPLOAD] PublishMap: Delete Zip (${homedir()+'/upload'+req.file.originalname}) ${errorToJson(err)}`)
          // 성공적으로 업로드된 파일 정보 반환
          httpLogger.info(`[UPLOAD] PublishMap: Delete Zip (${homedir()+'/upload'+req.file.originalname})`)
        });
      }
    });
  }
}
