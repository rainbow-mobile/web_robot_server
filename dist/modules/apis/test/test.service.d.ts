import { TestEntity, TestRecordEntity } from './entities/test.entity';
import { Repository } from 'typeorm';
import { CheckTestRunningDto, GetRecentTestResultDto, GetTestRecordListDto, GetTestResultBySubjectDto, InsertTestDataDto, InsertTestRecordDto, ResponseTestRecordListDto, ResponseTestResultDto, StartTestDto, TestRunningInfoDto, UpdateTestDataDto, UpdateTestRecordDto } from './dto/test.dto';
export declare class TestService {
    private readonly testRepository;
    private readonly testRecordRepository;
    runningTestInfo: TestRunningInfoDto | null;
    constructor(testRepository: Repository<TestEntity>, testRecordRepository: Repository<TestRecordEntity>);
    checkTestTable(): void;
    checkTestTableSchema(): Promise<void>;
    checkTestRecordTableSchema(): Promise<void>;
    insertTestRecord(data: InsertTestRecordDto): Promise<unknown>;
    updateTestRecord(data: UpdateTestRecordDto): Promise<unknown>;
    insertTestResult(data: InsertTestDataDto, sessionId: string): Promise<unknown>;
    upsertTestResult(updateTestDataDto: UpdateTestDataDto, sessionId: string): Promise<unknown>;
    getTestRecord(testRecordId: number): Promise<unknown>;
    getRecentTestResult({ subjects, }: GetRecentTestResultDto): Promise<ResponseTestResultDto>;
    getTestResultBySubject({ subject, }: GetTestResultBySubjectDto): Promise<ResponseTestResultDto>;
    getTestRecordAll(param: GetTestRecordListDto): Promise<ResponseTestRecordListDto>;
    observeTestRunning(): void;
    checkTestRunning(sessionId: string): Promise<CheckTestRunningDto>;
    startTest(param: StartTestDto, sessionId: string): Promise<unknown>;
    endTest(sessionId: string): Promise<unknown>;
}
