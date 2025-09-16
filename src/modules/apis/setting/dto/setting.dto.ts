import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

enum Description {
  ID = '요청 고유 아이디. 서버에서 자동생성되며 그대로 반환.',
  COMMAND = '세팅 명령어.',
  ROBOT_TYPE = '로봇 타입. 타입별로 세팅 파일 내용이 다름',
  TYPE = '파라미터 타입. float, string, boolean, int',
  DATA = '세팅 파일 내용. json 형식으로 저장되어 있음',
  NAME = '세팅 이름. 파일 내용을 수정할 때 세팅 변수의 이름',
  VALUE = '세팅 값. 파일 내용을 수정할 때 세팅 변수의 값. 모든 값은 string 형식으로 지정하여 송신',
  RESULT = '세팅 결과. success, fail',
  MESSAGE = '세팅 결과 메시지',
  PRESET = '프리셋 이름. 프리셋 파일이름이 preset_1.json 이라면 1로 보내주세요.',
  PRESET_LIST = '프리셋 리스트. 프리셋 파일이름이 preset_1.json 이라면 1로 보내주세요.',
  PARAM = '파라미터. 파라미터는 파라미터 이름, 파라미터 타입, 파라미터 값으로 구성되어 있습니다.',
}

export enum SettingCommand {
  //config.json 관련
  getSetting = 'getSetting',
  saveSetting = 'saveSetting',
  saveSettingAll = 'saveSettingAll',
  //config preset 관련
  getPresetList = 'getPresetList',
  getPreset = 'getPreset',
  deletePreset = 'deletePreset',
  createPreset = 'createPreset',
  savePreset = 'savePreset',
  //param 관련
  getParam = 'getParam',
  setParam = 'setParam',
  getDriveParam = 'getDriveParam',
}

export class SettingParam {
  @ApiProperty({
    description: Description.NAME,
    example: 'SPEAKER',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: Description.VALUE,
    example: 'true',
    required: false,
  })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiProperty({
    description: Description.TYPE,
    example: 'float',
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;
}

export class SettingRequestDto {
  @ApiProperty({
    description: Description.PRESET,
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsString()
  preset?: string;

  @ApiProperty({
    description: Description.PARAM,
    example: [{ name: 'SPEAKER', type: 'boolean', value: 'true' }],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => SettingParam)
  param?: SettingParam[];
}

export class SettingResponseDto extends SettingRequestDto {
  @ApiProperty({
    description: Description.PRESET_LIST,
    example: ['0', '1'],
    required: false,
  })
  @IsOptional()
  @IsString()
  list?: string[];
}

export class SettingRequestSlamnav extends SettingRequestDto {
  @ApiProperty({
    description: Description.ID,
    example: '1234567890',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: Description.COMMAND,
    example: SettingCommand.getSetting,
    enum: SettingCommand,
  })
  @IsString()
  command: string;
}

export class SettingResponseSlamnav extends SettingResponseDto {
  @ApiProperty({
    description: Description.ID,
    example: '1234567890',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: Description.COMMAND,
    example: SettingCommand.getSetting,
    enum: SettingCommand,
  })
  @IsString()
  command: string;

  @ApiProperty({
    description: Description.RESULT,
    example: 'success',
  })
  @IsString()
  result: string;

  @ApiProperty({
    description: Description.MESSAGE,
    example: '세팅 완료',
    required: false,
  })
  @IsString()
  @IsOptional()
  message?: string;
}

//API 문서용
export class SettingGetSettingRequestDto {}

export class SettingGetSettingResponseDto extends SettingGetSettingRequestDto {
  @ApiProperty({
    description: Description.DATA,
    example: [{ name: 'SPEAKER', type: 'boolean', value: 'true' }],
  })
  @IsArray()
  @ValidateNested()
  @Type(() => SettingParam)
  param: SettingParam[];
}

export class SettingSaveSettingRequestDto extends SettingGetSettingRequestDto {
  @ApiProperty({
    description: Description.DATA,
    example: [{ name: 'SPEAKER', type: 'boolean', value: 'true' }],
  })
  @IsArray()
  @ValidateNested()
  @Type(() => SettingParam)
  param: SettingParam[];
}
export class SettingSaveSettingResponseDto extends SettingSaveSettingRequestDto {}

export class SettingSaveSettingAllRequestDto extends SettingGetSettingRequestDto {
  @ApiProperty({
    description: Description.DATA,
    example: [{ name: 'USE_RRS', type: 'boolean', value: 'true' }],
  })
  @IsArray()
  @ValidateNested()
  @Type(() => SettingParam)
  param: SettingParam[];
}
export class SettingSaveSettingAllResponseDto extends SettingSaveSettingAllRequestDto {}

export class SettingGetPresetListRequestDto extends SettingGetSettingRequestDto {}
export class SettingGetPresetListResponseDto extends SettingGetPresetListRequestDto {
  @ApiProperty({
    description: Description.PRESET_LIST,
    example: ['0', '1'],
  })
  @IsString()
  list: string[];
}

export class SettingGetPresetRequestDto extends SettingGetSettingRequestDto {
  @ApiProperty({
    description: Description.PRESET,
    example: '1',
  })
  @IsString()
  preset: string;
}
export class SettingGetPresetResponseDto extends SettingGetPresetRequestDto {
  @ApiProperty({
    description: Description.DATA,
    example: [{ name: 'LIMIT_V', type: 'float', value: '1.2' }],
  })
  @IsArray()
  @ValidateNested()
  @Type(() => SettingParam)
  param: SettingParam[];
}

export class SettingCreatePresetRequestDto extends SettingGetPresetRequestDto {}
export class SettingCreatePresetResponseDto extends SettingCreatePresetRequestDto {
  @ApiProperty({
    description: Description.DATA,
    example: [{ name: 'LIMIT_V', type: 'float', value: '1.2' }],
  })
  @IsArray()
  @ValidateNested()
  @Type(() => SettingParam)
  data: SettingParam[];
}

export class SettingDeletePresetRequestDto extends SettingGetPresetRequestDto {}
export class SettingDeletePresetResponseDto extends SettingDeletePresetRequestDto {}

export class SettingSavePresetRequestDto extends SettingGetPresetRequestDto {
  @ApiProperty({
    description: Description.PARAM,
    example: [{ name: 'LIMIT_V', type: 'float', value: '1.2' }],
  })
  @IsArray()
  @ValidateNested()
  @Type(() => SettingParam)
  param: SettingParam[];
}
export class SettingSavePresetResponseDto extends SettingSavePresetRequestDto {}
export class SettingSetParamRequestDto {
  @ApiProperty({
    description: Description.PARAM,
    example: [{ name: 'SPEAKER', type: 'boolean', value: 'true' }],
  })
  @IsArray()
  @ValidateNested()
  @Type(() => SettingParam)
  param: SettingParam[];
}
export class SettingSetParamResponseDto extends SettingSetParamRequestDto {}
