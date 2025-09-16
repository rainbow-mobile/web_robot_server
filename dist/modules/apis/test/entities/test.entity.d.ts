export declare enum TestResult {
    SUCCESS = "SUCCESS",
    FAIL = "FAIL"
}
export declare class TestRecordEntity {
    id: number;
    tester: string;
    createdAt: Date;
    updatedAt: Date;
    tests: TestEntity[];
}
export declare class TestEntity {
    id: number;
    testRecordId: number;
    testRecord: TestRecordEntity;
    subject: string;
    result: TestResult | null;
    testAt: Date;
}
