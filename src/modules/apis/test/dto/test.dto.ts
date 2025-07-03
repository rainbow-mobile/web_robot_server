import { PaginationRequest } from '@common/pagination/pagination.request';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { SubjectEnum, TestResult } from '../entities/test.entity';
import { Transform, Type } from 'class-transformer';

export class TestResultDto {
  @ApiProperty({
    example: 1,
    description: '테스트 ID',
  })
  id: number;

  @ApiProperty({
    example: SubjectEnum.DISPLAY,
    description: '테스트 주제',
    enum: SubjectEnum,
  })
  subject: SubjectEnum;

  @ApiProperty({
    example: TestResult.SUCCESS,
    description: '테스트 결과',
    enum: TestResult,
  })
  result: TestResult;

  @ApiProperty({
    example: 'tester1',
    description: '테스트 수행자',
    nullable: true,
  })
  initTester: string | null;

  @ApiProperty({
    example: '1719878400000',
    description: '테스트 수행 시간',
  })
  testAt: Date;
}

export class GetTestResultBySubjectDto {
  @IsEnum(SubjectEnum)
  @ApiProperty({
    example: SubjectEnum.DISPLAY,
    description: '테스트 주제',
  })
  subject: SubjectEnum;
}

export class GetRecentTestResultBySubjectDto {
  @IsArray()
  @IsEnum(SubjectEnum, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((s) => s.trim());
    }
    return value;
  })
  @ApiProperty({
    example: [SubjectEnum.DISPLAY, SubjectEnum.SPEAKER],
    description: '테스트 주제 배열 (쉼표로 구분된 문자열도 지원)',
  })
  subjects: SubjectEnum[];
}

export class GetTestResultListDto extends PaginationRequest {
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      if (/^\d+$/.test(value)) return parseInt(value, 10);
      return value;
    }
    return value;
  })
  @IsNumber({}, { message: '숫자(timestamp) 또는 ISO 문자열이어야 합니다.' })
  @IsDateString({}, { message: 'ISO 날짜문자열이어야 합니다.' })
  @ApiProperty({
    type: String,
    description: '테스트 시작일 (timestamp 또는 ISO 문자열)',
    example: '1719878400000',
    required: false,
  })
  startDt?: number | string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      if (/^\d+$/.test(value)) return parseInt(value, 10);
      return value;
    }
    return value;
  })
  @IsNumber({}, { message: '숫자(timestamp) 또는 ISO 문자열이어야 합니다.' })
  @IsDateString({}, { message: 'ISO 날짜문자열이어야 합니다.' })
  @ApiProperty({
    type: String,
    description: '테스트 종료일 (timestamp 또는 ISO 문자열)',
    example: '1719878400000',
    required: false,
  })
  endDt?: number | string;

  @IsOptional()
  @IsArray()
  @IsEnum(SubjectEnum, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((s) => s.trim());
    }
    return value;
  })
  @ApiProperty({
    example: [SubjectEnum.DISPLAY, SubjectEnum.SPEAKER],
    description: '테스트 주제 배열 (쉼표로 구분된 문자열도 지원)',
    required: false,
    enum: SubjectEnum,
    isArray: true,
  })
  subject?: SubjectEnum[];

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'tester1',
    description: '테스트 수행자',
    required: false,
  })
  initTester?: string;

  @IsOptional()
  @IsEnum(['DESC', 'ASC'])
  @ApiProperty({
    example: 'DESC',
    description: '정렬 기준 (DESC, ASC)',
    enum: ['DESC', 'ASC'],
    default: 'DESC',
    required: false,
  })
  orderBy?: 'DESC' | 'ASC' = 'DESC';
}

export class UpdateTestDataDto {
  @IsEnum(SubjectEnum)
  @IsNotEmpty()
  @ApiProperty({
    example: SubjectEnum.DISPLAY,
    description: '테스트 주제',
    enum: SubjectEnum,
  })
  subject: SubjectEnum;

  @IsEnum(TestResult)
  @IsNotEmpty()
  @ApiProperty({
    example: TestResult.SUCCESS,
    description: '테스트 결과',
    enum: TestResult,
  })
  result: TestResult;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'tester1',
    description: '테스트 수행자',
    required: false,
  })
  initTester?: string;
}

export class ResponseTestResultDto {
  @IsArray({ each: true })
  @ValidateNested({ each: true })
  @Type(() => TestResultDto)
  @IsOptional()
  @ApiProperty({
    example: [],
    description: '테스트 결과 목록',
    type: TestResultDto,
    isArray: true,
  })
  items: TestResultDto[];
}

export class ResponseTestResultListDto extends ResponseTestResultDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    example: 10,
    description: '페이지 크기',
  })
  pageSize?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    example: 1,
    description: '전체 페이지 수',
  })
  totalPage?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    example: 100,
    description: '전체 테스트 결과 수',
  })
  totalCount: number;
}
