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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SettingJSONPayload } from '@common/interface/robot/setting.interface';
import { PresetDto } from 'src/modules/apis/setting/dto/setting.preset.dto';

@ApiTags('세팅 관련 API (setting)')
@Controller('setting')
export class SettingController {
  constructor(private readonly settingSsocketGatewayervice: SocketGateway) {}
  @Inject()
  private readonly settingService: SettingService;
}
