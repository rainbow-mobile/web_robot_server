import { TestService } from './test.service';
import { GetRecentTestResultBySubjectDto, GetTestResultBySubjectDto, GetTestResultListDto, ResponseTestResultDto, ResponseTestResultListDto, UpdateTestDataDto } from './dto/test.dto';
export declare class TestController {
    private readonly testService;
    constructor(testService: TestService);
    getTestResultList(param: GetTestResultListDto): Promise<ResponseTestResultListDto>;
    getRecentTestResultBySubject(param: GetRecentTestResultBySubjectDto): Promise<ResponseTestResultDto>;
    getTestResultBySubject(param: GetTestResultBySubjectDto): Promise<ResponseTestResultDto>;
    upsertTestResult(updateTestDataDto: UpdateTestDataDto): Promise<unknown>;
}
