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

export class GoalReadDto extends PaginationRequest {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example:'',
    required:false,
    description: '노드 타입'
  })
  type?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example:'',
    required:false,
    description: '검색단어'
  })
  searchText?: string;

}
