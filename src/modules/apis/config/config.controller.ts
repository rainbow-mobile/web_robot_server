import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import { ConfigService } from "./config.service";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import httpLogger from "@common/logger/http.logger";
import { HttpStatusMessagesConstants } from "@constants/http-status-messages.constants";
import { errorToJson } from "@common/util/error.util";
import { Response } from "express";
import { ConfigCommand, ConfigRequestDto } from "./dto/config.dto";

@Controller('config')
export class ConfigController {
    constructor(private readonly configService: ConfigService) {}

    @Get()
    @ApiOperation({
        summary: '파라미터 조회',
        description: '파라미터 조회 명령을 전달합니다',
    })
    async getConfig(@Res() res: Response) {
        try{
            const response = await this.configService.configRequest({
                command: ConfigCommand.getParam
            });
            res.send(response);
        }catch(error){
            httpLogger.error(`[CONFIG] getConfig: ${errorToJson(error)}`);
            res.status(error.status).send(error.data);
        }
    }

    @Get('drive')
    @ApiOperation({
        summary: '파라미터 조회',
        description: '파라미터 조회 명령을 전달합니다',
    })
    async getDriveConfig(@Res() res: Response) {
        try{
            const response = await this.configService.configRequest({
                command: ConfigCommand.getDriveParam
            });
            res.send(response);
        }catch(error){
            httpLogger.error(`[CONFIG] getDriveConfig: ${errorToJson(error)}`);
            res.status(error.status).send(error.data);
        }
    }

    @Post()
    @ApiOperation({
        summary: '파라미터 설정',
        description: '파라미터 설정 명령을 전달합니다',
    })
    async setConfig(@Body() body: ConfigRequestDto, @Res() res: Response) {
        try{
            const response = await this.configService.configRequest({command: ConfigCommand.setParam, params: body.parameters});
            res.send(response);
        }catch(error){
            httpLogger.error(`[CONFIG] setConfig: ${errorToJson(error)}`);
            res.status(error.status).send(error.data);
        }
    }
}