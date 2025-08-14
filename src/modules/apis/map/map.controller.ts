import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { MapService } from './map.service';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import httpLogger from '@common/logger/http.logger';
import { Response } from 'express';
import * as fs from 'fs';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import { GoalReadDto } from './dto/goal.read.dto';
import { errorToJson } from '@common/util/error.util';
import { PaginationResponse } from '@common/pagination/pagination.response';
import { join } from 'path';
import { homedir } from 'os';
import { HttpError } from '@influxdata/influxdb3-client';
import { ConfigService } from '@nestjs/config';

@ApiTags('맵 관련 API (map)')
@Controller('map')
export class MapController {
  constructor(
    private readonly socketGateway: SocketGateway,
    private readonly configService: ConfigService,
  ) {}
  @Inject()
  private readonly mapService: MapService;

  @Get()
  @ApiOperation({
    summary: '맵 리스트 요청',
    description:
      '로봇의 맵 리스트를 요청합니다. cloud.csv가 없는 폴더는 반환하지 않습니다.',
  })
  async getList(@Res() res: Response) {
    try {
      httpLogger.debug(`[MAP] getList`);
      const response = await this.mapService.getMapList();
      res.send(response);
    } catch (error) {
      httpLogger.error(
        `[MAP] getList: ${error.status} -> $${JSON.stringify(error.data)}`,
      );
      return res.status(error.status).send(error.data);
    }
  }

  @Get('current')
  @ApiOperation({
    summary: '현재 로드된 맵 이름 요청',
    description: '로봇의 맵 이름을 요청합니다.',
  })
  async getCurrentMapName(@Res() res: Response) {
    try {
      httpLogger.debug(
        `[MAP] getCurrentMapName: ${this.socketGateway.robotState.map.map_name}`,
      );
      res.send(JSON.stringify(this.socketGateway.robotState.map.map_name));
    } catch (error) {
      httpLogger.error(`[MAP] getCurrentMapName: ${JSON.stringify(error)}`);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500);
    }
  }

  @Post('load/:mapNm')
  @ApiOperation({
    summary: '맵 로드 요청',
    description: 'SLAMNAV에 맵 로드를 요청합니다.',
  })
  async loadMap(@Param('mapNm') mapNm: string, @Res() res: Response) {
    try {
      httpLogger.debug(`[MAP] loadMap: ${mapNm}`);
      if (mapNm == '') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: '맵 이름이 지정되지 않았습니다' });
      }
      const response = await this.mapService.loadMap(mapNm);
      httpLogger.info(`[MAP] loadMap Response: ${JSON.stringify(response)}`);
      res.send(response);
    } catch (error) {
      httpLogger.error(
        `[MAP] loadMap ${mapNm}: ${error.status} -> ${JSON.stringify(error.data)}`,
      );
      return res.status(error.status).send(error.data);
    }
  }

  @Get('cloud/:mapNm')
  @ApiOperation({
    summary: '맵 클라우드 요청',
    description: '맵 클라우드 데이터를 요청합니다.',
  })
  async getCloud(@Param('mapNm') mapNm: string, @Res() res: Response) {
    try {
      httpLogger.debug(`[MAP] getCloud: ${mapNm}`);
      const response = await this.mapService.readCloud(mapNm);
      res.send(response);
    } catch (error) {
      httpLogger.error(
        `[MAP] getCloud ${mapNm}: ${error.status} -> ${JSON.stringify(error.data)}`,
      );
      return res.status(error.status).send(error.data);
    }
  }

  @Get('cloud-pipe/test')
  @ApiOperation({
    summary: '맵 클라우드 요청 (파일 스트리밍)',
    description: '맵 클라우드 데이터를 요청합니다.',
  })
  async getCloudTest(
    @Req() req: Request,
    @Res() res: Response,
    @Query('download') download?: string,
  ) {
    try {
      const relPath = '/data/maps/Large/test.deb';

      console.log(req.headers);
      // 파일 존재 여부 확인
      const fullPath = relPath;
      if (!fs.existsSync(relPath)) {
        return res.status(HttpStatus.NOT_FOUND).send({
          message: '파일을 찾을 수 없습니다.',
          path: relPath,
        });
      }

      const stat = fs.statSync(fullPath);
      const fileSize = stat.size;
      const range = (req as any).headers.range; // e.g. "bytes=0-"

      // MIME 타입 동적 감지
      const fileName = relPath.split('/').pop() || 'file';
      const fileExtension = fileName.split('.').pop()?.toLowerCase();

      // 파일 확장자별 MIME 타입 매핑
      const mimeTypes: { [key: string]: string } = {
        csv: 'text/csv',
        txt: 'text/plain',
        json: 'application/json',
        xml: 'application/xml',
        deb: 'application/vnd.debian.binary-package',
        zip: 'application/zip',
        tar: 'application/x-tar',
        gz: 'application/gzip',
        bz2: 'application/x-bzip2',
        '7z': 'application/x-7z-compressed',
        pdf: 'application/pdf',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        svg: 'image/svg+xml',
        mp4: 'video/mp4',
        avi: 'video/x-msvideo',
        mov: 'video/quicktime',
        wav: 'audio/wav',
        mp3: 'audio/mpeg',
        ogg: 'audio/ogg',
      };

      const mime = mimeTypes[fileExtension] || 'application/octet-stream';
      const encodedFileName = encodeURIComponent(fileName);
      const disposition =
        download === '1'
          ? `attachment; filename="${encodedFileName}"`
          : `inline; filename="${encodedFileName}"`;

      // 캐시 헤더 설정 (대용량 파일 최적화)
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Disposition', disposition);

      if (!range) {
        // 전체 스트림 (200) - 용량 제한 없음
        res.status(HttpStatus.OK);
        res.setHeader('Content-Type', mime);
        res.setHeader('Content-Length', fileSize.toString());

        const stream = fs.createReadStream(fullPath, {
          highWaterMark: 64 * 1024, // 64KB 청크 크기
        });

        // 클라이언트가 중간에 끊으면 스트림 닫기
        (req as any).on('close', () => {
          stream.destroy();
          httpLogger.debug(
            '[MAP] getCloudTest: Client disconnected, stream destroyed',
          );
        });

        // 에러 처리
        stream.on('error', (error) => {
          httpLogger.error(
            `[MAP] getCloudTest: Stream error - ${error.message}`,
          );
          if (!res.headersSent) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
              message: '파일 스트리밍 중 오류가 발생했습니다.',
            });
          }
        });

        stream.pipe(res);
        return;
      }

      // Range 요청 처리 (206) - 대용량 파일에 권장
      const m = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!m) {
        res.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE).end();
        return;
      }

      let start = m[1] ? parseInt(m[1], 10) : 0;
      let end = m[2] ? parseInt(m[2], 10) : fileSize - 1;

      // 범위 정규화
      if (isNaN(start) && !isNaN(end)) {
        // bytes=-500 (마지막 500바이트)
        start = Math.max(0, fileSize - end);
        end = fileSize - 1;
      }
      if (!isNaN(start) && isNaN(end)) {
        // bytes=500- (500부터 끝까지)
        end = fileSize - 1;
      }

      // 범위 유효성 검사
      if (start < 0 || end < 0 || start > end || end >= fileSize) {
        res.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE).end();
        return;
      }

      // 청크 크기 제한 없음
      const chunkSize = end - start + 1;
      const finalChunkSize = chunkSize;

      res.status(HttpStatus.PARTIAL_CONTENT);
      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Length', finalChunkSize.toString());
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);

      const stream = fs.createReadStream(fullPath, {
        start,
        end,
        highWaterMark: 64 * 1024, // 64KB 청크 크기
      });

      (req as any).on('close', () => {
        stream.destroy();
        httpLogger.debug(
          '[MAP] getCloudTest: Client disconnected, range stream destroyed',
        );
      });

      // 에러 처리
      stream.on('error', (error) => {
        httpLogger.error(
          `[MAP] getCloudTest: Range stream error - ${error.message}`,
        );
        if (!res.headersSent) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
            message: '파일 스트리밍 중 오류가 발생했습니다.',
          });
        }
      });

      stream.pipe(res);
    } catch (error) {
      httpLogger.error(`[MAP] getCloudTest: ${error.message || error}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: '파일 처리 중 오류가 발생했습니다.',
        error: error.message,
      });
    }
  }

  @Post('cloud/:mapNm')
  @ApiOperation({
    summary: '맵 클라우드 저장',
    description: '맵 클라우드 데이터를 저장합니다.',
  })
  async saveCloud(
    @Param('mapNm') mapNm: string,
    @Body() data: any[],
    @Res() res: Response,
  ) {
    try {
      httpLogger.debug(`[MAP] saveCloud: ${mapNm}`);
      if (mapNm == '') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: '맵 이름이 지정되지 않았습니다' });
      } else if (!Array.isArray(data) || data.length == 0) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: '클라우드 데이터가 지정되지 않았습니다' });
      }
      const response = await this.mapService.saveCloud(mapNm, data);
      res.send(response);

      httpLogger.info(`[MAP] saveCloud -> auto map load ${mapNm}`);
      this.socketGateway.slamnav?.emit('load', {
        command: 'mapload',
        name: mapNm,
        time: Date.now().toString(),
      });
    } catch (error) {
      httpLogger.error(
        `[MAP] saveCloud ${mapNm}: ${error.status} -> ${JSON.stringify(error.data)}`,
      );
      return res.status(error.status).send(error.data);
    }
  }

  @Get('tiles/:mapNm')
  @ApiOperation({
    summary: '맵 타일 존재 여부 요청',
    description: '맵 tiles 디렉토리가 있는지 여부를 요청합니다.',
  })
  async getTilesExist(@Param('mapNm') mapNm: string) {
    try {
      if (mapNm === undefined || mapNm === '') {
        throw new HttpError(
          HttpStatus.BAD_REQUEST,
          'mapNm이 지정되지 않았습니다.',
        );
      }
      const dataBasePath = this.configService.get('dataBasePath');
      const path = join(homedir(), 'maps', mapNm, 'tiles');
      const path2 = join(dataBasePath, 'maps', mapNm, 'tiles');

      if (fs.existsSync(path)) {
        return true;
      } else if (fs.existsSync(path2)) {
        return true;
      }
      return false;
    } catch (error) {
      httpLogger.error(
        `[MAP] getTilesExist : ${error.status} -> ${JSON.stringify(error.data)}`,
      );
      throw new HttpError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        '요청을 수행하던 중 서버에 에러가 발생했습니다.',
      );
    }
  }

  @Get('tiles/:mapNm/:z/:x/:y')
  @ApiOperation({
    summary: '맵 타일 png 요청',
    description: '맵 tiles 의 .png 파일을 요청합니다.',
  })
  async getTiles(
    @Param('mapNm') mapNm: string,
    @Param('z') z: string,
    @Param('y') y: string,
    @Param('x') x: string,
    @Res() res: Response,
  ) {
    try {
      httpLogger.debug(`[MAP] getTopogetTileslogy: ${mapNm}`);
      if (mapNm == '') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: '맵 이름이 지정되지 않았습니다' });
      }
      if (x === undefined || x === '') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: 'x값이 없습니다' });
      }
      if (y === undefined || y === '') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: 'y값이 없습니다' });
      }
      if (z === undefined || z === '') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: 'z값이 없습니다' });
      }
      const dataBasePath = this.configService.get('dataBasePath');
      const path = join(homedir(), 'maps', mapNm, 'tiles', z, x, y + '.png');
      const path2 = join(
        dataBasePath,
        'maps',
        mapNm,
        'tiles',
        z,
        x,
        y + '.png',
      );
      if (fs.existsSync(path)) {
        const stream = fs.createReadStream(path);

        res.set({
          'Content-Type': 'image/png',
        });

        stream.pipe(res);
      } else if (fs.existsSync(path2)) {
        const stream = fs.createReadStream(path2);

        res.set({
          'Content-Type': 'image/png',
        });

        stream.pipe(res);
      } else {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: '파일을 찾을 수 없습니다' });
      }
    } catch (error) {
      httpLogger.error(
        `[MAP] getTopology ${mapNm}: ${error.status} -> ${JSON.stringify(error.data)}`,
      );
      return res.status(error.status).send(error.data);
    }
  }

  @Get('topo/:mapNm')
  @ApiOperation({
    summary: '맵 토폴로지 요청',
    description: '맵 토폴로지 데이터를 요청합니다.',
  })
  async getTopology(@Param('mapNm') mapNm: string, @Res() res: Response) {
    try {
      httpLogger.debug(`[MAP] getTopology: ${mapNm}`);
      if (mapNm == '') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: '맵 이름이 지정되지 않았습니다' });
      }
      const response = await this.mapService.readTopology(mapNm);
      res.send(response);
    } catch (error) {
      httpLogger.error(
        `[MAP] getTopology ${mapNm}: ${error.status} -> ${JSON.stringify(error.data)}`,
      );
      return res.status(error.status).send(error.data);
    }
  }

  @Post('topo/:mapNm')
  @ApiOperation({
    summary: '맵 토폴로지 저장',
    description: '맵 토폴로지 데이터를 저장합니다.',
  })
  async saveTopology(
    @Param('mapNm') mapNm: string,
    @Body() data: JSON,
    @Res() res: Response,
  ) {
    try {
      httpLogger.debug(`[MAP] saveTopology: ${mapNm}`);
      if (mapNm == '') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: '맵 이름이 지정되지 않았습니다' });
      } else if (!Array.isArray(data) || data.length == 0) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: '토폴로지 데이터가 지정되지 않았습니다' });
      }
      const response = await this.mapService.saveTopology(mapNm, data);
      res.send(response);

      httpLogger.info(`[MAP] saveTopology -> auto map load ${mapNm}`);
      this.socketGateway.slamnav?.emit('load', {
        command: 'mapload',
        name: mapNm,
        time: Date.now().toString(),
      });
    } catch (error) {
      httpLogger.error(
        `[MAP] saveTopology ${mapNm}: ${error.status} -> ${JSON.stringify(error.data)}`,
      );
      return res.status(error.status).send(error.data);
    }
  }

  @Get('nodes/:mapNm')
  @ApiOperation({
    summary: '맵 노드 리스트 요청 (페이지네이션)',
    description: '맵 노드 리스트를 요청합니다.',
  })
  async getNodes(
    @Param('mapNm') mapNm: string,
    @Query() param: GoalReadDto,
    @Res() res: Response,
  ) {
    try {
      httpLogger.debug(
        `[MAP] getNodes: ${mapNm}, ${param.pageNo}, ${param.pageSize}, ${param.type}, ${param.searchText}`,
      );
      if (mapNm == '') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: '맵 이름이 지정되지 않았습니다' });
      }
      const data = await this.mapService.readTopology(mapNm);
      const goals = [];
      console.log(data.length);
      if (Array.isArray(data)) {
        data.map((node) => {
          if (node.type == param.type) {
            // console.log("match")
            if (param.searchText != '' && param.searchText != undefined) {
              if (
                node.id
                  .toLowerCase()
                  .includes(param.searchText.toLowerCase()) ||
                node.name.toLowerCase().includes(param.searchText.toLowerCase())
              ) {
                goals.push({
                  id: node.id,
                  name: node.name,
                  x: node.pose.split(',')[0],
                  y: node.pose.split(',')[1],
                  rz: node.pose.split(',')[5],
                });
              }
            } else {
              goals.push({
                id: node.id,
                name: node.name,
                x: node.pose.split(',')[0],
                y: node.pose.split(',')[1],
                rz: node.pose.split(',')[5],
              });
            }
          }
        });
      }

      const totalItems = goals.length;
      let startIndex: number =
        (Number(param.pageNo) - 1) * Number(param.pageSize);
      let endIndex: number = startIndex + Number(param.pageSize);

      if (param.sortOption == 'name') {
        goals.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { numeric: true }),
        );
      } else {
        goals.sort((a, b) =>
          a.id.localeCompare(b.id, undefined, { numeric: true }),
        );
      }
      while (startIndex >= totalItems) {
        param.pageNo--;
        startIndex = (Number(param.pageNo) - 1) * Number(param.pageSize);
        endIndex = startIndex + Number(param.pageSize);
      }
      console.log(totalItems, startIndex, endIndex);
      const items = goals.slice(startIndex, endIndex);
      //sort

      console.log(items);
      res.send(
        new PaginationResponse(goals.length, Number(param.pageSize), items),
      );
    } catch (error) {
      httpLogger.error(`[LOG] getStatus Log : ${errorToJson(error)}`);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
      });
    }
  }

  @Get('goals/:mapNm')
  @ApiOperation({
    summary: '맵 골 리스트 요청',
    description: '맵 골 리스트를 요청합니다.',
  })
  async getGoals(@Param('mapNm') mapNm: string, @Res() res: Response) {
    try {
      httpLogger.debug(`[MAP] getGoals: ${mapNm}`);
      if (mapNm == '') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: '맵 이름이 지정되지 않았습니다' });
      }
      const response = await this.mapService.readTopology(mapNm);
      const goals = [];
      if (Array.isArray(response)) {
        response.map((node) => {
          if (node.type == 'GOAL' || node.type == 'INIT') {
            goals.push({
              id: node.id,
              name: node.name,
              x: node.pose.split(',')[0],
              y: node.pose.split(',')[1],
              rz: node.pose.split(',')[5],
            });
          }
        });
      }
      //sort
      goals.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true }),
      );

      console.log('goals', goals);
      res.send(goals);
    } catch (error) {
      httpLogger.error(
        `[MAP] getGoals ${mapNm}: ${error.status} -> ${JSON.stringify(error.data)}`,
      );
      return res.status(error.status).send(error.data);
    }
  }

  @Delete('delete/:mapNm')
  @ApiOperation({
    summary: '맵 삭제',
    description: '맵을 삭제합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '맵 삭제 성공',
  })
  @ApiResponse({
    status: 404,
    description: '맵 삭제 실패',
  })
  async deleteMap(@Param('mapNm') mapNm: string, @Res() res: Response) {
    try {
      httpLogger.debug(`[MAP] deleteMap: ${mapNm}`);
      const response = await this.mapService.deleteMap(mapNm);
      res.send(response);
    } catch (error) {
      httpLogger.error(
        `[MAP] deleteMap ${mapNm}: ${error.status} -> ${JSON.stringify(error.data)}`,
      );
      return res.status(error.status).send(error.data);
    }
  }
}
