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
      await this.uploadService.zipFolder(originalFilePath, zipFilePath);

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
      console.log("send /frs-map/upload ",global.frs_api)
      const response = await axios.post(
        global.frs_api + "/api/maps/frs-map/upload",
        formData,
        config
      );
      console.log(response.data);
      res.send({ message: "파일 저장 성공" });
    }catch(error){
      httpLogger.error(`uplodaMap Error : ${error}`)
      res.status(error.status).send(error.data);
    }finally{
      fs.unlink(zipFilePath, (err) => {
        if (err) console.error("임시 ZIP 파일 삭제 실패:", err);
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
      console.log("Map Download : ", data.name, data.userId, data.token);

        const response = await axios.get(
          global.frs_api + "/api/maps/frs-map/download",
          {
            responseType: "stream",
            params: { attachmentFileDtlFlNm: data.name, deleteZipAt: "Y" },
            headers: { authorization: "Bearer " + data.token },
          }
        );

        const fileStream = fs.createWriteStream(homedir() + "/maps/" + data.name);
        response.data.pipe(fileStream);

        fileStream.on("finish", async() => {
          console.log("file download successfully");

          const zipFilePath = path.join(homedir(), "maps", data.name);

          const extractToPath = path.join(homedir(), "maps", data.name.split(".")[0]);
          console.log("Map Download : ", zipFilePath, extractToPath);

          await this.uploadService.unzipFolder(zipFilePath, extractToPath);

          res.status(HttpStatus.CREATED).send({message:HttpStatusMessagesConstants.MAP.SUCCESS_201});

          console.log("압축파일 삭제 : ", homedir() + "/maps/" + data.name);
          fs.unlink(homedir() + "/maps/" + data.name, (err) => {
            if (err) console.error("임시 ZIP 파일 삭제 실패:", err);
            console.log("성공");
          });
        });
      
    } catch (error) {
      console.error("파일 다운로드 중 오류 발생:", error.response.status);
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
        console.error(err);
        return res.status(400).send({ message: '파일 업로드 실패', error: err.message });
      }

      try{
        const zipFilePath = path.join(homedir(), "upload", req.file.originalname);
  
        const extractToPath = path.join(homedir(), "maps", mapNm);
        console.log("Map Download : ", zipFilePath, extractToPath);
  
        await this.uploadService.unzipFolder(zipFilePath, extractToPath);
  
        console.log("압축파일 삭제 : ", homedir() + "/upload/" + req.file.originalname);

        res.status(HttpStatus.CREATED).send({message:HttpStatusMessagesConstants.MAP.SUCCESS_201,
          filename: req.file.filename});  
          


      }catch(error){
        httpLogger.error(`PublishMap Error : ${mapNm}, ${req.file.originalname}, ${error}`)
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500)
      }finally{
        fs.unlink(homedir() + "/upload/" + req.file.originalname, (err) => {
          if (err) console.error("임시 ZIP 파일 삭제 실패:", err);
          // 성공적으로 업로드된 파일 정보 반환
        });
      }
    });
  }
}
