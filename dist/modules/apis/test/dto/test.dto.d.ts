import { PaginationRequest } from '@common/pagination/pagination.request';
import { SubjectEnum, TestResult } from '../entities/test.entity';
export declare class TestResultDto {
    id: number;
    subject: SubjectEnum;
    result: TestResult;
    initTester: string | null;
    testAt: Date;
}
export declare class GetTestResultBySubjectDto {
    subject: SubjectEnum;
}
export declare class GetRecentTestResultBySubjectDto {
    subjects: SubjectEnum[];
}
export declare class GetTestResultListDto extends PaginationRequest {
    startDt?: number | string;
    endDt?: number | string;
    subject?: SubjectEnum[];
    initTester?: string;
    orderBy?: 'DESC' | 'ASC';
}
export declare class UpdateTestDataDto {
    subject: SubjectEnum;
    result: TestResult;
    initTester?: string;
}
export declare class ResponseTestResultDto {
    items: TestResultDto[];
}
export declare class ResponseTestResultListDto extends ResponseTestResultDto {
    pageSize?: number;
    totalPage?: number;
    totalCount: number;
}
