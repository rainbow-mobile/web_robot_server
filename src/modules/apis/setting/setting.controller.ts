import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import { Response } from 'express';
import httpLogger from '@common/logger/http.logger';
import { SettingService } from './setting.service';
import { SocketGateway } from '@sockets/gateway/sockets.gateway';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SettingJSONPayload } from '@common/interface/robot/setting.interface';
import { PresetDto } from 'src/modules/apis/setting/dto/setting.preset.dto';
import { CameraOrderChangeDto } from './dto/setting.camera.dto';

@ApiTags('세팅 관련 API (setting)')
@Controller('setting')
export class SettingController {
  constructor(private readonly settingSsocketGatewayervice: SocketGateway) {}
  @Inject()
  private readonly settingService: SettingService;

  @Get(':type')
  @ApiOperation({
    summary: '세팅 파일 요청',
    description: '타입에 해당하는 세팅 파일을 요청합니다.',
  })
  async getSetting(@Param('type') type: string, @Res() res: Response) {
    try {
      if (type == '') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: HttpStatusMessagesConstants.INVALID_DATA_400 });
      }
      const response = await this.settingService.getSetting(type);
      return res.send(response);
    } catch (error) {
      httpLogger.error(
        `[SETTING] getSetting: ${type}, ${error.status} -> ${error.data}`,
      );
      return res.status(error.status).send(error.data);
    }
  }

  @Post(':type')
  @ApiOperation({
    summary: '세팅 파일 저장',
    description: '타입에 해당하는 세팅 파일을 저장합니다.',
  })
  async saveSetting(
    @Param('type') type: string,
    @Body() data: JSON,
    @Res() res: Response,
  ) {
    try {
      httpLogger.debug(
        `[SETTING] save Setting: ${type}, ${JSON.stringify(data)}`,
      );
      if (type == '') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: HttpStatusMessagesConstants.INVALID_DATA_400 });
      }

      const response = await this.settingService.saveSetting(type, data);
      httpLogger.debug(
        `[SETTING] save Setting Response: ${JSON.stringify(response)}`,
      );
      res.send(response);
    } catch (error) {
      httpLogger.error(
        `[SETTING] save Setting: ${error.status} -> ${error.data}`,
      );
      return res.status(error.status).send(error.data);
    }
  }

  @Get('preset/:type')
  @ApiOperation({
    summary: '세팅 프리셋 리스트 요청',
    description: '타입에 해당하는 세팅 프리셋 리스트를 요청합니다.',
  })
  async getPresetList(@Param('type') type: string, @Res() res: Response) {
    try {
      httpLogger.debug(`[SETTING] get Preset List: ${type}`);
      if (type == '') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: HttpStatusMessagesConstants.INVALID_DATA_400 });
      }
      const response = await this.settingService.getPresetList(type);
      httpLogger.debug(
        `[SETTING] get Preset List: ${JSON.stringify(response)}`,
      );
      return res.send(response);
    } catch (error) {
      httpLogger.error(
        `[SETTING] get Preset List: ${error.status} -> ${error.data}`,
      );
      return res.status(error.status).send(error.data);
    }
  }

  @Post('preset/:type/:id')
  @ApiOperation({
    summary: '세팅 프리셋 파일 생성',
    description: '타입에 해당하는 세팅 프리셋을 생성합니다.',
  })
  async makePreset(
    @Param('type') type: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      httpLogger.debug(`[SETTING] make Preset: type=${type}, id=${id}`);
      if (type == '' || id == '') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: HttpStatusMessagesConstants.INVALID_DATA_400 });
      }
      const response = await this.settingService.makePreset(type, id);
      httpLogger.debug(`[SETTING] make Preset: ${JSON.stringify(response)}`);
      return res.send(response);
    } catch (error) {
      httpLogger.error(
        `[SETTING] make Preset: ${error.status} -> ${error.data}`,
      );
      return res.status(error.status).send(error.data);
    }
  }

  @Get('preset/:type/:id')
  @ApiOperation({
    summary: '세팅 프리셋 파일 요청',
    description: '프리셋 파일 데이터를 요청합니다',
  })
  async getPreset(
    @Param('type') type: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      httpLogger.debug(`[SETTING] get Preset: type=${type}, id=${id}`);
      if (type == '') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: HttpStatusMessagesConstants.INVALID_DATA_400 });
      }
      const response = await this.settingService.getPreset(type, id);
      httpLogger.debug(`[SETTING] get Preset: ${JSON.stringify(response)}`);
      return res.send(response);
    } catch (error) {
      httpLogger.error(
        `[SETTING] get Preset: ${error.status} -> ${error.data}`,
      );
      return res.status(error.status).send(error.data);
    }
  }

  @Put('preset/:type/:id')
  @ApiOperation({
    summary: '세팅 프리셋 파일 수정',
    description: '프리셋 파일 데이터를 수정합니다',
  })
  async savePreset(
    @Param('type') type: string,
    @Param('id') id: string,
    @Body() data: PresetDto,
    @Res() res: Response,
  ) {
    try {
      httpLogger.debug(
        `[SETTING] save Preset: type=${type}, id=${id}, data=${JSON.stringify(data)}`,
      );
      if (type == '') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: HttpStatusMessagesConstants.INVALID_DATA_400 });
      }

      if (
        isNaN(Number(data.LIMIT_V)) ||
        isNaN(Number(data.LIMIT_V_ACC)) ||
        isNaN(Number(data.LIMIT_W)) ||
        isNaN(Number(data.LIMIT_W_ACC)) ||
        isNaN(Number(data.LIMIT_PIVOT_W)) ||
        isNaN(Number(data.ED_V)) ||
        isNaN(Number(data.DRIVE_EPS)) ||
        isNaN(Number(data.DRIVE_H)) ||
        isNaN(Number(data.DRIVE_K)) ||
        isNaN(Number(data.DRIVE_L)) ||
        isNaN(Number(data.DRIVE_T)) ||
        isNaN(Number(data.ST_V)) ||
        isNaN(Number(data.DRIVE_A)) ||
        isNaN(Number(data.DRIVE_B))
      ) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: HttpStatusMessagesConstants.INVALID_DATA_400 });
      }

      const response = await this.settingService.savePreset(type, id, data);
      httpLogger.debug(`[SETTING] save Preset: ${JSON.stringify(response)}`);
      return res.send(response);
    } catch (error) {
      httpLogger.error(
        `[SETTING] save Preset: ${error.status} -> ${error.data}`,
      );
      return res.status(error.status).send(error.data);
    }
  }

  @Delete('preset/:type/:id')
  @ApiOperation({
    summary: '세팅 프리셋 파일 삭제',
    description: '프리셋 파일을 삭제합니다',
  })
  async deletePreset(
    @Param('type') type: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      httpLogger.debug(`[SETTING] delete Preset: type=${type}, id=${id}`);
      if (type == '' || id == '') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: HttpStatusMessagesConstants.INVALID_DATA_400 });
      }

      const response = await this.settingService.deletePreset(type, id);
      httpLogger.debug(`[SETTING] delete Preset: ${JSON.stringify(response)}`);
      return res.send(response);
    } catch (error) {
      httpLogger.error(
        `[SETTING] delete Preset: ${error.status} -> ${error.data}`,
      );
      return res.status(error.status).send(error.data);
    }
  }

  @Post('cam/order-change')
  @ApiOperation({
    summary: '카메라 순서 변경',
    description: '카메라 순서를 변경합니다',
  })
  @ApiBody({
    type: CameraOrderChangeDto,
    description: '카메라 순서 변경 데이터',
  })
  @ApiResponse({
    status: 200,
    description: '카메라 순서 변경 성공',
    type: CameraOrderChangeDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류',
  })
  async orderChange(@Body() data: CameraOrderChangeDto) {
    return this.settingService.cameraOrderChange(data);
  }
}
