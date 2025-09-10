import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import httpLogger from '@common/logger/http.logger';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import { errorToJson } from '@common/util/error.util';
import { Response } from 'express';
import { ConfigCommand, ConfigRequestDto } from './dto/config.dto';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}
}
