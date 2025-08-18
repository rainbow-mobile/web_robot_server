import { PaginationRequest } from '@common/pagination/pagination.request';
import { PaginationResponse } from '@common/pagination/pagination.response';
import { DateUtil } from '@common/util/date.util';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class MapPipeRequestDto {
  @IsString()
  @ApiProperty({
    example: 'Test',
    required: true,
    description: '맵 이름',
  })
  mapName: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'cloud.csv',
    required: false,
    description: '파일 이름',
  })
  fileName?: string;

}
