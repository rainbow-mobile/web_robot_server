import { PaginationRequest } from '@common/pagination/pagination.request';
import { TestResult } from '../entities/test.entity';
export declare class TestResultDto {
    id: number;
    testRecordId: number;
    subject: string;
    result: TestResult | null;
    testAt: Date;
}
export declare class TestRecordDto {
    id: number;
    tests: TestResultDto[];
    tester: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class GetTestResultBySubjectDto {
    subject: string;
}
export declare class GetRecentTestResultDto {
    subjects?: string[];
}
export declare class GetTestRecordListDto extends PaginationRequest {
    startDt?: number | string;
    endDt?: number | string;
    subject?: string[];
    tester?: string;
    orderBy?: 'DESC' | 'ASC';
}
export declare class InsertTestDataDto {
    subject: string;
    result: TestResult;
}
export declare class UpdateTestDataDto extends InsertTestDataDto {
    testRecordId: number;
}
export declare class ResponseTestResultDto {
    items: TestResultDto[];
}
export declare class ResponseTestRecordDto {
    items: TestRecordDto[];
}
export declare class ResponseTestRecordListDto extends ResponseTestRecordDto {
    pageSize?: number;
    totalPage?: number;
    totalCount: number;
}
export declare class InsertTestRecordDto {
    tester?: string | null;
    subjects: string[];
}
export declare class UpdateTestRecordDto {
    id: number;
    tester?: string | null;
}
export declare class StartTestDto {
    tester: string;
    testRecordId: number;
}
export declare class TestRunningInfoDto {
    tester: string;
    testRecordId: number;
    testSessionId: string;
    testEndTimestamp: number;
}
export declare class CheckTestRunningDto {
    testRecordId?: number;
    tester?: string;
    isRunning: boolean;
}
