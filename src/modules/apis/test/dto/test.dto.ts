import { PaginationRequest } from '@common/pagination/pagination.request';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TestResult } from '../entities/test.entity';
import { Transform, Type } from 'class-transformer';

export class TestResultDto {
  @ApiProperty({
    example: 1,
    description: '테스트 ID',
  })
  id: number;

  @ApiProperty({
    example: 1,
    description: '테스트 레코드 ID',
  })
  testRecordId: number;

  @ApiProperty({
    example: 'DISPLAY',
    description: '테스트 주제',
  })
  subject: string;

  @ApiProperty({
    example: TestResult.SUCCESS,
    description: '테스트 결과',
    enum: TestResult,
    nullable: true,
    default: null,
  })
  result: TestResult | null;

  @ApiProperty({
    example: '2025-07-16T07:56:52.000Z',
    description: '테스트 수행 시간',
  })
  testAt: Date;
}

export class TestRecordDto {
  @ApiProperty({
    example: 1,
    description: '테스트 레코드 ID',
  })
  id: number;

  @ApiProperty({
    example: [],
    description: '테스트 결과 목록',
    type: TestResultDto,
    isArray: true,
  })
  tests: TestResultDto[];

  @ApiProperty({
    example: 'tester1',
    description: '테스트 수행자',
    nullable: true,
    default: null,
  })
  tester: string;

  @ApiProperty({
    example: '2025-07-16T07:56:52.000Z',
    description: '테스트 레코드 생성 시간',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-07-16T07:56:52.000Z',
    description: '테스트 레코드 수정 시간',
  })
  updatedAt: Date;
}

export class GetTestResultBySubjectDto {
  @IsString()
  @ApiProperty({
    example: 'DISPLAY',
    description: '테스트 주제',
  })
  subject: string;
}

export class GetRecentTestResultDto {
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((s) => s.trim());
    }
    return value;
  })
  @ApiProperty({
    example: ['DISPLAY', 'SPEAKER'],
    description: '테스트 주제 배열 (쉼표로 구분된 문자열도 지원)',
    required: false,
    isArray: true,
  })
  subjects?: string[];
}

export class GetTestRecordListDto extends PaginationRequest {
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
    example: '2025-07-16T07:56:52.000Z',
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
    example: '2025-07-16T07:56:52.000Z',
    required: false,
  })
  endDt?: number | string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((s) => s.trim());
    }
    return value;
  })
  @ApiProperty({
    example: ['DISPLAY', 'SPEAKER'],
    description: '테스트 주제 배열 (쉼표로 구분된 문자열도 지원)',
    required: false,
    isArray: true,
  })
  subject?: string[];

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'tester1',
    description: '테스트 수행자',
    required: false,
  })
  tester?: string;

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

export class InsertTestDataDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'DISPLAY',
    description: '테스트 주제',
  })
  subject: string;

  @IsEnum(TestResult)
  @IsNotEmpty()
  @ApiProperty({
    example: TestResult.SUCCESS,
    description: '테스트 결과',
    enum: TestResult,
  })
  result: TestResult;
}

export class UpdateTestDataDto extends InsertTestDataDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: '테스트 레코드 ID',
  })
  testRecordId: number;
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

export class ResponseTestRecordDto {
  @IsArray({ each: true })
  @ValidateNested({ each: true })
  @Type(() => TestRecordDto)
  @IsOptional()
  @ApiProperty({
    example: [],
    description: '테스트 레코드 목록',
    type: TestRecordDto,
    isArray: true,
  })
  items: TestRecordDto[];
}

export class ResponseTestRecordListDto extends ResponseTestRecordDto {
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

export class InsertTestRecordDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'tester1',
    description: '테스트 수행자',
    required: false,
    nullable: true,
    default: null,
  })
  tester?: string | null;

  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  @ApiProperty({
    example: ['DISPLAY', 'SPEAKER'],
    description: '테스트 주제 배열',
    isArray: true,
  })
  subjects: string[];
}

export class UpdateTestRecordDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: '테스트 레코드 ID',
  })
  id: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'tester1',
    description: '테스트 수행자',
    nullable: true,
    required: false,
    default: null,
  })
  tester?: string | null;
}

export class StartTestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'tester1',
    description: '테스트 수행자',
  })
  tester: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: '테스트 레코드 ID',
  })
  testRecordId: number;
}

export class TestRunningInfoDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'tester1',
    description: '테스트 수행자',
  })
  tester: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: '테스트 레코드 ID',
  })
  testRecordId: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'test-session-1234567890',
    description: '테스트 세션 ID',
  })
  testSessionId: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: '테스트 종료 시간',
  })
  testEndTimestamp: number;
}

export class CheckTestRunningDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    example: 1,
    description: '테스트 레코드 ID',
    required: false,
    nullable: true,
    default: undefined,
  })
  testRecordId?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'tester1',
    description: '테스트 수행자',
    required: false,
    nullable: true,
    default: undefined,
  })
  tester?: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    example: true,
    description: '테스트 진행 여부',
  })
  isRunning: boolean;
}
