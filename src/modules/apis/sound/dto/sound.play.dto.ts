import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SoundPlayDto {
  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: '파일 이름',
    example: 'test.mp3',
    required: true,
  })
  @Expose()
  fileNm: string;

  @IsInt()
  @ApiProperty({
    description: '재생 볼륨',
    example: 100,
    required: true,
  })
  @Expose()
  volume: number;

  @IsBoolean()
  @ApiProperty({
    description:
      '응답을 오디오 재생 끝나고나서 받을지(true), 재생 시작하고 받을지(false)',
    example: false,
    required: true,
  })
  @Expose()
  waitDone: boolean;

  @IsBoolean()
  @ApiProperty({
    description: '반복재생 모드',
    example: false,
    required: true,
  })
  @Expose()
  repeat: boolean;
}
