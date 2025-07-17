import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { TestService } from './test.service';
import {
  GetRecentTestResultBySubjectDto,
  GetTestResultBySubjectDto,
  GetTestResultListDto,
  ResponseTestResultDto,
  ResponseTestResultListDto,
  TestResultDto,
  UpdateTestDataDto,
} from './dto/test.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('테스트 관리')
@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get('list')
  @ApiOperation({
    summary: '테스트 결과 목록 조회',
    description:
      '페이지네이션과 필터링을 지원하는 테스트 결과 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '테스트 결과 목록 조회 성공',
    type: ResponseTestResultListDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 파라미터',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류',
  })
  getTestResultList(@Query() param: GetTestResultListDto) {
    return this.testService.getTestResultAll(param);
  }

  @Get('get-recent')
  @ApiOperation({
    summary: '주제별 최근 테스트 결과 조회',
    description: '지정된 주제들의 최근 테스트 결과를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '최근 테스트 결과 조회 성공',
    type: ResponseTestResultDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 파라미터',
  })
  getRecentTestResultBySubject(
    @Query() param: GetRecentTestResultBySubjectDto,
  ) {
    return this.testService.getRecentTestResultBySubject(param);
  }

  @Get('get-by-subject')
  @ApiOperation({
    summary: '특정 주제 테스트 결과 조회',
    description: '특정 주제의 모든 테스트 결과를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '주제별 테스트 결과 조회 성공',
    type: ResponseTestResultDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 파라미터',
  })
  getTestResultBySubject(@Query() param: GetTestResultBySubjectDto) {
    return this.testService.getTestResultBySubject(param);
  }

  @Post()
  @ApiOperation({
    summary: '테스트 결과 생성/수정',
    description: '새로운 테스트 결과를 생성하거나 기존 결과를 수정합니다.',
  })
  @ApiBody({
    type: UpdateTestDataDto,
    description: '테스트 결과 데이터',
    examples: {
      success: {
        summary: '성공 케이스',
        value: {
          subject: 'DISPLAY',
          result: 'SUCCESS',
          initTester: 'tester1',
        },
      },
      fail: {
        summary: '실패 케이스',
        value: {
          subject: 'SPEAKER',
          result: 'FAIL',
          initTester: 'tester2',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '테스트 결과 생성/수정 성공',
    type: TestResultDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류',
  })
  upsertTestResult(@Body() updateTestDataDto: UpdateTestDataDto) {
    return this.testService.upsertTestResult(updateTestDataDto);
  }
}
