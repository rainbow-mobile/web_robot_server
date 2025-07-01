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

export class LogReadDto extends PaginationRequest {
  @IsDateString()
  @IsOptional()
  @ApiProperty({
    example: '2025-01-01',
    // example: '2025-01-01',
    description: '로그 시작일',
    required: false,
  })
  startDt?: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty({
    example: DateUtil.formatDateYYYYMMDD(new Date()),
    description: '로그 종료일',
    required: false,
  })
  endDt?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    example: ['error', 'warn', 'info', 'debug'],
    required: false,
    description: '로그 레벨',
  })
  @Expose()
  levels?: string[];

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '',
    required: false,
    description: '로그 카테고리',
  })
  category?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '',
    required: false,
    description: '검색옵션',
  })
  searchType?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '',
    required: false,
    description: '검색단어',
  })
  searchText?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '',
    required: false,
    description: '정렬옵션',
  })
  sortOption?: string;
}
