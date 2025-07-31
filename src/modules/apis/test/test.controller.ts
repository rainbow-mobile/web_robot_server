import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Put,
  Param,
  Req,
} from '@nestjs/common';
import { TestService } from './test.service';
import {
  CheckTestRunningDto,
  GetRecentTestResultDto,
  GetTestRecordListDto,
  GetTestResultBySubjectDto,
  InsertTestRecordDto,
  ResponseTestRecordListDto,
  ResponseTestResultDto,
  StartTestDto,
  TestRecordDto,
  TestResultDto,
  TestRunningInfoDto,
  UpdateTestDataDto,
  UpdateTestRecordDto,
} from './dto/test.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('테스트 관리')
@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get('record/list')
  @ApiOperation({
    summary: '테스트 결과 목록 조회',
    description:
      '페이지네이션과 필터링을 지원하는 테스트 결과 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '테스트 결과 목록 조회 성공',
    type: ResponseTestRecordListDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 파라미터',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류',
  })
  getTestRecordList(@Query() param: GetTestRecordListDto) {
    return this.testService.getTestRecordAll(param);
  }

  @Get('record/:id')
  @ApiOperation({
    summary: '테스트 레코드 조회',
    description: '테스트 레코드를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '테스트 레코드 조회 성공',
    type: TestRecordDto,
  })
  getTestRecord(@Param('id') id: string) {
    return this.testService.getTestRecord(Number(id));
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
  getRecentTestResult(@Query() param: GetRecentTestResultDto) {
    return this.testService.getRecentTestResult(param);
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

  @Get('check-test-running')
  @ApiOperation({
    summary: '테스트 진행 여부 확인',
    description: '테스트 진행 여부를 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '테스트 진행 여부 확인 성공',
    type: CheckTestRunningDto,
  })
  checkTestRunning(@Req() req: Request) {
    const sessionId = req.sessionID;
    return this.testService.checkTestRunning(sessionId);
  }

  @Post('start')
  @ApiOperation({
    summary: '테스트 시작',
    description: '테스트를 시작합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '테스트 시작 성공',
    type: TestRunningInfoDto,
  })
  @ApiResponse({
    status: 400,
    description: '이미 진행중인 테스트가 있습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류',
  })
  startTest(@Req() req: Request, @Body() param: StartTestDto) {
    const sessionId = req.sessionID;
    return this.testService.startTest(param, sessionId);
  }

  @Post('end')
  @ApiOperation({
    summary: '테스트 종료',
    description: '테스트를 종료합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '테스트 종료 성공',
  })
  @ApiResponse({
    status: 400,
    description:
      '테스트 시작 API를 통해 테스트를 시작하지 않았습니다. 테스트 시작 API를 통해 테스트를 시작하세요.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류',
  })
  endTest(@Req() req: Request) {
    const sessionId = req.sessionID;
    return this.testService.endTest(sessionId);
  }

  @Post('record')
  @ApiOperation({
    summary: '테스트 레코드 생성',
    description: '새로운 테스트 레코드를 생성합니다.',
  })
  @ApiBody({
    type: InsertTestRecordDto,
    description: '테스트 레코드 데이터',
  })
  @ApiResponse({
    status: 200,
    description: '테스트 레코드 생성 성공',
    type: TestRecordDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류',
  })
  insertTestRecord(@Body() insertTestRecordDto: InsertTestRecordDto) {
    return this.testService.insertTestRecord(insertTestRecordDto);
  }

  @Put('record')
  @ApiOperation({
    summary: '테스트 레코드 수정',
    description: '기존 테스트 레코드를 수정합니다.',
  })
  @ApiBody({
    type: UpdateTestRecordDto,
    description: '테스트 레코드 데이터',
  })
  @ApiResponse({
    status: 200,
    description: '테스트 레코드 수정 성공',
    type: TestRecordDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 오류',
  })
  updateTestRecord(@Body() updateTestRecordDto: UpdateTestRecordDto) {
    return this.testService.updateTestRecord(updateTestRecordDto);
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
  upsertTestResult(
    @Req() req: Request,
    @Body() updateTestDataDto: UpdateTestDataDto,
  ) {
    const sessionId = req.sessionID;
    return this.testService.upsertTestResult(updateTestDataDto, sessionId);
  }
}
