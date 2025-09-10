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
import {
  ConfigCommand,
  ConfigParameterDto,
  ConfigParameterType,
  ConfigRequestDto,
  Result,
} from 'src/modules/apis/config/dto/config.dto';

export class ConfigRequestSlamnav {
  @ApiProperty({
    description: '명령을 보낼 협동로봇이 연결된 TCP 포트번호',
    example: ConfigCommand.setParam,
    enum: ConfigCommand,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  command: string;

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
  params?: ConfigParameterDto[];
}

export class ConfigResponseSlamnav extends ConfigRequestSlamnav {
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
