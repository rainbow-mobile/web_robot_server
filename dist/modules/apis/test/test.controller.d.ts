import { TestService } from './test.service';
import { CheckTestRunningDto, GetRecentTestResultDto, GetTestRecordListDto, GetTestResultBySubjectDto, InsertTestRecordDto, ResponseTestRecordListDto, ResponseTestResultDto, StartTestDto, UpdateTestDataDto, UpdateTestRecordDto } from './dto/test.dto';
import { Request } from 'express';
export declare class TestController {
    private readonly testService;
    constructor(testService: TestService);
    getTestRecordList(param: GetTestRecordListDto): Promise<ResponseTestRecordListDto>;
    getTestRecord(id: string): Promise<unknown>;
    getRecentTestResult(param: GetRecentTestResultDto): Promise<ResponseTestResultDto>;
    getTestResultBySubject(param: GetTestResultBySubjectDto): Promise<ResponseTestResultDto>;
    checkTestRunning(req: Request): Promise<CheckTestRunningDto>;
    startTest(req: Request, param: StartTestDto): Promise<unknown>;
    endTest(req: Request): Promise<unknown>;
    insertTestRecord(insertTestRecordDto: InsertTestRecordDto): Promise<unknown>;
    updateTestRecord(updateTestRecordDto: UpdateTestRecordDto): Promise<unknown>;
    upsertTestResult(req: Request, updateTestDataDto: UpdateTestDataDto): Promise<unknown>;
}
