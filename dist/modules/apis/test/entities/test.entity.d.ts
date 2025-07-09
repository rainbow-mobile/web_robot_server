export declare enum SubjectEnum {
    DISPLAY = "DISPLAY",
    SPEAKER = "SPEAKER",
    CAMERA = "CAMERA",
    CHARGER = "CHARGER",
    MAP_MOVE = "MAP_MOVE"
}
export declare enum TestResult {
    SUCCESS = "SUCCESS",
    FAIL = "FAIL"
}
export declare class TestEntity {
    id: number;
    subject: SubjectEnum;
    result: TestResult;
    initTester: string | null;
    testAt: Date;
}
