import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { TestService } from './test.service';
import {
  GetRecentTestResultBySubjectDto,
  GetTestResultBySubjectDto,
  GetTestResultListDto,
  UpdateTestDataDto,
} from './dto/test.dto';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get('list')
  getTestResultList(@Query() param: GetTestResultListDto) {
    return this.testService.getTestResultAll(param);
  }

  @Get('get-recent')
  getRecentTestResultBySubject(
    @Query() param: GetRecentTestResultBySubjectDto,
  ) {
    return this.testService.getRecentTestResultBySubject(param);
  }

  @Get('get-by-subject')
  getTestResultBySubject(@Query() param: GetTestResultBySubjectDto) {
    return this.testService.getTestResultBySubject(param);
  }

  @Post()
  upsertTestResult(@Body() updateTestDataDto: UpdateTestDataDto) {
    return this.testService.upsertTestResult(updateTestDataDto);
  }
}
