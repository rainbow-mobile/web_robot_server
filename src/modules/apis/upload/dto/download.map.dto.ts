import {
  IsArray,
  IsLatLong,
  IsOptional,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DownloadMapDto {
  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: '다운로드할 맵의 이름 (FRS 상에 저장된 맵)',
    example: 'Map',
  })
  name: string;

  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: '유저 아이디',
    example: 'rainbow',
  })
  userId: string;

  @IsString()
  @Length(1, 255)
  @ApiProperty({
    description: '유저 토큰',
    example: '',
  })
  token: string;
}
