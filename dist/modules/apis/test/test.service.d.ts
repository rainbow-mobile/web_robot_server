import { TestEntity } from './entities/test.entity';
import { Repository } from 'typeorm';
import { GetRecentTestResultBySubjectDto, GetTestResultBySubjectDto, GetTestResultListDto, ResponseTestResultDto, ResponseTestResultListDto, UpdateTestDataDto } from './dto/test.dto';
export declare class TestService {
    private readonly testRepository;
    constructor(testRepository: Repository<TestEntity>);
    checkTestTable(): Promise<any>;
    upsertTestResult(updateTestDataDto: UpdateTestDataDto): Promise<unknown>;
    getRecentTestResultBySubject({ subjects, }: GetRecentTestResultBySubjectDto): Promise<ResponseTestResultDto>;
    getTestResultBySubject({ subject, }: GetTestResultBySubjectDto): Promise<ResponseTestResultDto>;
    getTestResultAll(param: GetTestResultListDto): Promise<ResponseTestResultListDto>;
}
