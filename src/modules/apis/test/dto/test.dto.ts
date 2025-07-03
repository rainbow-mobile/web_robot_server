import { PaginationRequest } from '@common/pagination/pagination.request';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { SubjectEnum, TestResult } from '../entities/test.entity';
import { Transform } from 'class-transformer';

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
  @IsDateString()
  @ApiProperty({
    example: '2025-01-01',
    description: '테스트 시작일',
    required: false,
  })
  startDt?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({
    example: '2025-01-31',
    description: '테스트 종료일',
    required: false,
  })
  endDt?: string;

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
