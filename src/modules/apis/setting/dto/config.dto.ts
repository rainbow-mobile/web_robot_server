import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export enum ConfigCommand {
  getDriveParam = 'getDriveParam',
  getParam = 'getParam',
  setParam = 'setParam',
}

export enum ConfigParameterType {
  float = 'float',
  string = 'string',
  boolean = 'boolean',
  int = 'int',
}

export enum Result {
  accept = 'accept',
  reject = 'reject',
  fail = 'fail',
  success = 'success',
}

export class ConfigParameterDto {
  @ApiProperty({
    description: '파라미터 이름',
    example: 'param1',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '파라미터 타입',
    example: ConfigParameterType.float,
    required: true,
    enum: ConfigParameterType,
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: '파라미터 값. string으로 변환하여 입력하세요.',
    example: '15.0',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class ConfigRequestDto {
  @ApiProperty({
    description: '파라미터 목록',
    example: [
      {
        name: 'v_limit_jog',
        value: '0.1',
        type: ConfigParameterType.float,
      },
    ],
    required: false,
  })
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfigParameterDto)
  parameters?: ConfigParameterDto[];
}

export class ConfigResponseDto extends ConfigRequestDto {
  @ApiProperty({
    description: '결과 상태',
    example: Result.accept,
    enum: Result,
    required: true,
  })
  @IsString()
  result: string;

  @ApiProperty({
    description:
      '결과 메시지. result값이 reject, fail일 경우 메시지 내용을 확인하세요.',
    example: '파라미터의 값이 범위를 벗어났습니다.',
    required: false,
  })
  @IsOptional()
  @IsString()
  message?: string;
}
