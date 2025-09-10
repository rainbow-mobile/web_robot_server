import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { Body } from '@nestjs/common';
import { Delete } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkResponse } from '@nestjs/swagger';
import { SettingCommand } from './dto/setting.dto';
import { SettingGetSettingResponseDto } from './dto/setting.dto';
import { SettingGetSettingRequestDto } from './dto/setting.dto';
import { SettingService } from './setting.service';
import { SettingSaveSettingResponseDto } from './dto/setting.dto';
import { SettingSaveSettingRequestDto } from './dto/setting.dto';
import { SettingSaveSettingAllResponseDto } from './dto/setting.dto';
import { SettingSaveSettingAllRequestDto } from './dto/setting.dto';
import { SettingGetPresetListResponseDto } from './dto/setting.dto';
import { SettingGetPresetListRequestDto } from './dto/setting.dto';
import { SettingGetPresetResponseDto } from './dto/setting.dto';
import { SettingGetPresetRequestDto } from './dto/setting.dto';
import { SettingSavePresetResponseDto } from './dto/setting.dto';
import { SettingSavePresetRequestDto } from './dto/setting.dto';
import { SettingDeletePresetResponseDto } from './dto/setting.dto';
import { SettingDeletePresetRequestDto } from './dto/setting.dto';
import { Response } from 'express';
import { SettingCreatePresetResponseDto } from './dto/setting.dto';
import { SettingCreatePresetRequestDto } from './dto/setting.dto';
import { ConfigCommand } from '../config/dto/config.dto';
import { SettingSetParamRequestDto } from './dto/setting.dto';
import { HttpStatusMessagesConstants } from '@constants/http-status-messages.constants';
import { SettingFileService } from './setting-file.service';
import httpLogger from '@common/logger/http.logger';
import { PresetDto } from './dto/setting.preset.dto';

@Controller('settings')
@ApiTags('세팅 API (SLAMNAV 저장 방식)')
export class SettingController {
  constructor(
    private readonly settingService: SettingService,
    private readonly settingFileService: SettingFileService,
  ) {}
  generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  @Get()
  @ApiOperation({
    summary: '세팅 파일 요청',
    description: '타입에 해당하는 세팅 파일을 요청합니다.',
  })
  @ApiOkResponse({
    description: '세팅 파일 요청 성공',
    type: SettingGetSettingResponseDto,
  })
  async getSetting(@Query() dto: SettingGetSettingRequestDto) {
    return this.settingService.settingRequest({
      id: this.generateId(),
      command: SettingCommand.getSetting,
    });
  }

  @Post()
  @ApiOperation({
    summary: '세팅 파일 저장',
    description: '타입에 해당하는 세팅 파일을 저장합니다.',
  })
  @ApiOkResponse({
    description: '세팅 파일 저장 성공',
    type: SettingSaveSettingResponseDto,
  })
  async saveSetting(@Body() dto: SettingSaveSettingRequestDto) {
    if (dto.param == null || dto.param == undefined || dto.param.length == 0) {
      throw new HttpException('데이터를 입력해주세요.', HttpStatus.BAD_REQUEST);
    }
    return this.settingService.settingRequest({
      id: this.generateId(),
      command: SettingCommand.saveSetting,
      param: dto.param,
    });
  }

  //   @Post('all')
  //   @ApiOperation({
  //     summary: '세팅 파일 전체 저장',
  //     description: '타입에 해당하는 세팅 파일을 전체 저장합니다.',
  //   })
  //   @ApiOkResponse({
  //     description: '세팅 파일 전체 저장 성공',
  //     type: SettingSaveSettingAllResponseDto,
  //   })
  //   async saveSettingAll(@Body() dto: SettingSaveSettingAllRequestDto) {
  //     if (dto.param == null || dto.param == undefined || dto.param.length == 0) {
  //       throw new HttpException('데이터를 입력해주세요.', HttpStatus.BAD_REQUEST);
  //     }
  //     return this.settingService.settingRequest({
  //       id: this.generateId(),
  //       command: SettingCommand.saveSettingAll,
  //       param: dto.param,
  //     });
  //   }

  //   @Get('preset/list')
  //   @ApiOperation({
  //     summary: '세팅 프리셋 리스트 요청',
  //     description:
  //       '타입에 해당하는 세팅 프리셋 리스트를 요청합니다. 반환되는 프리셋 파일의 형식은 반드시 preset_{number}.json 형식입니다.',
  //   })
  //   @ApiOkResponse({
  //     description: '세팅 프리셋 리스트 요청 성공',
  //     type: SettingGetPresetListResponseDto,
  //   })
  //   async getPresetList(@Query() dto: SettingGetPresetListRequestDto) {
  //     return this.settingService.settingRequest({
  //       id: this.generateId(),
  //       command: SettingCommand.getPresetList,
  //     });
  //   }

  //   @Get('preset')
  //   @ApiOperation({
  //     summary: '세팅 프리셋 요청',
  //     description: '타입에 해당하는 세팅 프리셋을 요청합니다.',
  //   })
  //   @ApiOkResponse({
  //     description: '세팅 프리셋 요청 성공',
  //     type: SettingGetPresetResponseDto,
  //   })
  //   async getPreset(@Query() dto: SettingGetPresetRequestDto) {
  //     if (dto.preset == null || dto.preset == undefined || dto.preset == '') {
  //       throw new HttpException('프리셋을 입력해주세요.', HttpStatus.BAD_REQUEST);
  //     }
  //     return this.settingService.settingRequest({
  //       id: this.generateId(),
  //       command: SettingCommand.getPreset,
  //       preset: dto.preset,
  //     });
  //   }

  //   @Post('preset')
  //   @ApiOperation({
  //     summary: '세팅 프리셋 저장',
  //     description: '타입에 해당하는 세팅 프리셋을 저장합니다.',
  //   })
  //   @ApiOkResponse({
  //     description: '세팅 프리셋 저장 성공',
  //     type: SettingSavePresetResponseDto,
  //   })
  //   async savePreset(@Body() dto: SettingSavePresetRequestDto) {
  //     if (dto.preset == null || dto.preset == undefined || dto.preset == '') {
  //       throw new HttpException('프리셋을 입력해주세요.', HttpStatus.BAD_REQUEST);
  //     }
  //     if (dto.param == null || dto.param == undefined || dto.param.length == 0) {
  //       throw new HttpException('데이터를 입력해주세요.', HttpStatus.BAD_REQUEST);
  //     }
  //     return this.settingService.settingRequest({
  //       id: this.generateId(),
  //       command: SettingCommand.savePreset,
  //       preset: dto.preset,
  //       param: dto.param,
  //     });
  //   }

  //   @Delete('preset')
  //   @ApiOperation({
  //     summary: '세팅 프리셋 삭제',
  //     description: '타입에 해당하는 세팅 프리셋을 삭제합니다.',
  //   })
  //   @ApiOkResponse({
  //     description: '세팅 프리셋 삭제 성공',
  //     type: SettingDeletePresetResponseDto,
  //   })
  //   async deletePreset(@Query() dto: SettingDeletePresetRequestDto) {
  //     if (dto.preset == null || dto.preset == undefined || dto.preset == '') {
  //       throw new HttpException('프리셋을 입력해주세요.', HttpStatus.BAD_REQUEST);
  //     }
  //     return this.settingService.settingRequest({
  //       id: this.generateId(),
  //       command: SettingCommand.deletePreset,
  //       preset: dto.preset,
  //     });
  //   }

  //   @Post('preset/new')
  //   @ApiOperation({
  //     summary: '세팅 프리셋 파일 생성',
  //     description: '타입에 해당하는 세팅 프리셋을 생성합니다.',
  //   })
  //   @ApiOkResponse({
  //     description: '세팅 프리셋 파일 생성 성공',
  //     type: SettingCreatePresetResponseDto,
  //   })
  //   async createPreset(@Query() dto: SettingCreatePresetRequestDto) {
  //     if (dto.preset == null || dto.preset == undefined || dto.preset == '') {
  //       throw new HttpException('프리셋을 입력해주세요.', HttpStatus.BAD_REQUEST);
  //     }
  //     return this.settingService.settingRequest({
  //       id: this.generateId(),
  //       command: SettingCommand.createPreset,
  //       preset: dto.preset,
  //     });
  //   }

  @Get('pdu')
  @ApiOperation({
    summary: 'PDU 파라미터 조회',
    description: 'PDU 파라미터 조회 명령을 전달합니다',
  })
  async getPduParameter() {
    throw new HttpException(
      '아직 구현되지 않은 기능입니다.',
      HttpStatus.NOT_IMPLEMENTED,
    );
    return this.settingService.settingRequest({
      id: this.generateId(),
      command: ConfigCommand.getParam,
    });
  }

  @Get('pdu/drive')
  @ApiOperation({
    summary: 'PDU 파라미터 조회',
    description: 'PDU 파라미터 조회 명령을 전달합니다',
  })
  async getDriveConfig() {
    return await this.settingService.settingRequest({
      id: this.generateId(),
      command: SettingCommand.getDriveParam,
    });
  }

  @Post('pdu')
  @ApiOperation({
    summary: 'PDU 파라미터 설정',
    description: 'PDU 파라미터 설정 명령을 전달합니다',
  })
  async setPduParameter(@Body() dto: SettingSetParamRequestDto) {
    if (dto.param == null || dto.param == undefined || dto.param.length == 0) {
      throw new HttpException(
        '파라미터를 입력해주세요.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.settingService.settingRequest({
      id: this.generateId(),
      command: SettingCommand.setParam,
      param: dto.param,
    });
  }
}
