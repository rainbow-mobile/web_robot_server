"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const test_entity_1 = require("./entities/test.entity");
const typeorm_2 = require("typeorm");
const http_logger_1 = require("../../../common/logger/http.logger");
const error_util_1 = require("../../../common/util/error.util");
const http_status_messages_constants_1 = require("../../../common/constants/http-status-messages.constants");
const pagination_response_1 = require("../../../common/pagination/pagination.response");
let TestService = class TestService {
    constructor(testRepository, testRecordRepository) {
        this.testRepository = testRepository;
        this.testRecordRepository = testRecordRepository;
        this.runningTestInfo = null;
        this.checkTestTable();
        this.checkTestTableSchema();
        this.checkTestRecordTableSchema();
    }
    checkTestTable() {
        this.testRecordRepository.query(`
      CREATE TABLE IF NOT EXISTS test_record (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tester VARCHAR(128),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
        this.testRepository.query(`
      CREATE TABLE IF NOT EXISTS test (
        id INT AUTO_INCREMENT PRIMARY KEY,
        test_record_id INT,
        subject VARCHAR(128),
        result ENUM('SUCCESS', 'FAIL') DEFAULT NULL,
        testAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (test_record_id) REFERENCES test_record(id)
      )
    `);
    }
    async checkTestTableSchema() {
        const expectedColumns = [
            { name: 'id', type: 'INT AUTO_INCREMENT PRIMARY KEY' },
            { name: 'test_record_id', type: 'INT' },
            { name: 'subject', type: 'VARCHAR(128)' },
            { name: 'result', type: "ENUM('SUCCESS', 'FAIL') DEFAULT NULL" },
            { name: 'testAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
        ];
        const columns = await this.testRepository.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'test'`);
        const actualColumnNames = columns.map((col) => col.COLUMN_NAME);
        for (const col of expectedColumns) {
            if (!actualColumnNames.includes(col.name)) {
                await this.testRepository.query(`ALTER TABLE test ADD COLUMN ${col.name} ${col.type}`);
                http_logger_1.default.warn(`[TEST] test 테이블에 누락된 컬럼 '${col.name}'을(를) 추가했습니다.`);
            }
        }
        for (const colName of actualColumnNames) {
            if (!expectedColumns.map((col) => col.name).includes(colName)) {
                await this.testRepository.query(`ALTER TABLE test DROP COLUMN ${colName}`);
                http_logger_1.default.warn(`[TEST] test 테이블에 불필요한 컬럼 '${colName}'을(를) 삭제했습니다.`);
            }
        }
    }
    async checkTestRecordTableSchema() {
        const expectedColumns = [
            { name: 'id', type: 'INT AUTO_INCREMENT PRIMARY KEY' },
            { name: 'tester', type: 'VARCHAR(128)' },
            { name: 'createdAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
            { name: 'updatedAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
        ];
        const columns = await this.testRecordRepository.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'test_record'`);
        const actualColumnNames = columns.map((col) => col.COLUMN_NAME);
        for (const col of expectedColumns) {
            if (!actualColumnNames.includes(col.name)) {
                await this.testRecordRepository.query(`ALTER TABLE test_record ADD COLUMN ${col.name} ${col.type}`);
                http_logger_1.default.warn(`[TEST] test_record 테이블에 누락된 컬럼 '${col.name}'을(를) 추가했습니다.`);
            }
        }
        for (const colName of actualColumnNames) {
            if (!expectedColumns.map((col) => col.name).includes(colName)) {
                await this.testRecordRepository.query(`ALTER TABLE test_record DROP COLUMN ${colName}`);
                http_logger_1.default.warn(`[TEST] test_record 테이블에 불필요한 컬럼 '${colName}'을(를) 삭제했습니다.`);
            }
        }
    }
    insertTestRecord(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const testRecord = this.testRecordRepository.create(data);
                const result = await this.testRecordRepository.save(testRecord);
                for (const subject of data.subjects) {
                    const test = this.testRepository.create({
                        testRecordId: result.id,
                        subject: subject,
                    });
                    await this.testRepository.save(test);
                }
                resolve(result);
            }
            catch (error) {
                http_logger_1.default.error(`[TEST] insertTestRecord : ${(0, error_util_1.errorToJson)(error)}`);
                reject({
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    data: {
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                        error: error,
                    },
                });
            }
        });
    }
    updateTestRecord(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const testRecord = await this.testRecordRepository.findOne({
                    where: { id: data.id },
                });
                if (!testRecord) {
                    reject({
                        status: common_1.HttpStatus.NOT_FOUND,
                        data: {
                            message: http_status_messages_constants_1.HttpStatusMessagesConstants.DB.NOT_FOUND_404,
                        },
                    });
                    return;
                }
                Object.assign(testRecord, data);
                const result = await this.testRecordRepository.save(testRecord);
                resolve(result);
            }
            catch (error) {
                http_logger_1.default.error(`[TEST] updateTestRecord : ${(0, error_util_1.errorToJson)(error)}`);
                reject({
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    data: {
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                        error: error,
                    },
                });
            }
        });
    }
    insertTestResult(data, sessionId) {
        return new Promise(async (resolve, reject) => {
            try {
                const test = this.testRepository.create(data);
                const result = await this.testRepository.save(test);
                resolve(result);
            }
            catch (error) {
                http_logger_1.default.error(`[TEST] insertTestResult : ${(0, error_util_1.errorToJson)(error)}`);
                reject({
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    data: {
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                        error: error,
                    },
                });
            }
        });
    }
    upsertTestResult(updateTestDataDto, sessionId) {
        return new Promise(async (resolve, reject) => {
            try {
                const test = await this.testRepository.findOne({
                    where: {
                        testRecordId: updateTestDataDto.testRecordId,
                        subject: updateTestDataDto.subject,
                    },
                });
                if (!test) {
                    const result = await this.insertTestResult(updateTestDataDto, sessionId);
                    resolve(result);
                    return;
                }
                Object.assign(test, updateTestDataDto);
                const result = await this.testRepository.save(test);
                resolve(result);
            }
            catch (error) {
                http_logger_1.default.error(`[TEST] upsertTestResult : (${updateTestDataDto}) ${(0, error_util_1.errorToJson)(error)}`);
                reject({
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    data: {
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                        error: error,
                    },
                });
            }
        });
    }
    getTestRecord(testRecordId) {
        return new Promise(async (resolve, reject) => {
            try {
                const queryBuilder = this.testRecordRepository
                    .createQueryBuilder('test_record')
                    .where('test_record.id = :testRecordId', { testRecordId })
                    .leftJoinAndSelect('test_record.tests', 'tests');
                const result = await queryBuilder.getOne();
                if (!result) {
                    reject({
                        status: common_1.HttpStatus.NOT_FOUND,
                        data: {
                            message: http_status_messages_constants_1.HttpStatusMessagesConstants.DB.NOT_FOUND_404,
                        },
                    });
                    return;
                }
                resolve(result);
            }
            catch (error) {
                http_logger_1.default.error(`[TEST] getTestResultByTestRecordId : ${(0, error_util_1.errorToJson)(error)}`);
                reject({
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    data: {
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                        error: error,
                    },
                });
            }
        });
    }
    getRecentTestResult({ subjects, }) {
        return new Promise(async (resolve, reject) => {
            try {
                const latestTestRecord = await this.testRecordRepository
                    .createQueryBuilder('test_record')
                    .orderBy('test_record.createdAt', 'DESC')
                    .limit(1)
                    .getOne();
                if (!latestTestRecord) {
                    resolve({
                        items: [],
                    });
                    return;
                }
                const queryBuilder = this.testRepository
                    .createQueryBuilder('test')
                    .where('test.test_record_id = :testRecordId', {
                    testRecordId: latestTestRecord.id,
                });
                if (subjects && subjects.length > 0) {
                    queryBuilder.andWhere('test.subject IN (:...subjects)', { subjects });
                }
                const result = await queryBuilder
                    .orderBy('test.testAt', 'DESC')
                    .getMany();
                resolve({
                    items: result,
                });
            }
            catch (error) {
                http_logger_1.default.error(`[TEST] getRecentTestResultBySubject : ${(0, error_util_1.errorToJson)(error)}`);
                reject({
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    data: {
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                        error: error,
                    },
                });
            }
        });
    }
    getTestResultBySubject({ subject, }) {
        return new Promise(async (resolve, reject) => {
            try {
                const items = await this.testRepository
                    .createQueryBuilder('test')
                    .where('test.subject = :subject', { subject })
                    .orderBy('test.testAt', 'DESC')
                    .getMany();
                resolve({
                    items,
                });
            }
            catch (error) {
                http_logger_1.default.error(`[TEST] getTestResultBySubject : ${(0, error_util_1.errorToJson)(error)}`);
                reject({
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    data: {
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                        error: error,
                    },
                });
            }
        });
    }
    getTestRecordAll(param) {
        return new Promise(async (resolve, reject) => {
            try {
                const queryBuilder = this.testRecordRepository
                    .createQueryBuilder('test_record')
                    .leftJoinAndSelect('test_record.tests', 'tests');
                if (param.startDt) {
                    const startDate = new Date(param.startDt);
                    startDate.setHours(0, 0, 0, 0);
                    queryBuilder.andWhere('test_record.createdAt >= :startDt', {
                        startDt: startDate,
                    });
                }
                if (param.endDt) {
                    const endDate = new Date(param.endDt);
                    endDate.setHours(23, 59, 59, 999);
                    queryBuilder.andWhere('test_record.createdAt <= :endDt', {
                        endDt: endDate,
                    });
                }
                if (param.tester) {
                    queryBuilder.andWhere('test_record.tester LIKE :tester', {
                        tester: `%${param.tester}%`,
                    });
                }
                if (param.subject && param.subject.length > 0) {
                    queryBuilder.andWhere('tests.subject IN (:...subjects)', {
                        subjects: param.subject,
                    });
                }
                queryBuilder.orderBy('test_record.createdAt', param.orderBy || 'DESC');
                if (!param.pageNo) {
                    const items = await queryBuilder.getMany();
                    const totalCount = items.length;
                    resolve({
                        totalCount,
                        items,
                    });
                    return;
                }
                const totalCount = await queryBuilder.getCount();
                const items = await queryBuilder
                    .skip(param.getOffset())
                    .take(param.getLimit())
                    .getMany();
                resolve(new pagination_response_1.PaginationResponse(totalCount, param.getLimit(), items));
            }
            catch (error) {
                http_logger_1.default.error(`[TEST] getTestRecordAll : ${(0, error_util_1.errorToJson)(error)}`);
                reject({
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    data: {
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                        error: error,
                    },
                });
            }
        });
    }
    observeTestRunning() {
        if (this.runningTestInfo) {
            if (this.runningTestInfo.testEndTimestamp < Date.now()) {
                this.endTest(this.runningTestInfo.testSessionId);
            }
            else {
                setTimeout(() => {
                    this.observeTestRunning();
                }, 1000);
            }
        }
    }
    checkTestRunning(sessionId) {
        console.log(this.runningTestInfo?.testSessionId, sessionId);
        return new Promise(async (resolve) => {
            if (this.runningTestInfo) {
                if (this.runningTestInfo.testSessionId === sessionId) {
                    resolve({
                        isRunning: false,
                    });
                }
                else {
                    resolve({
                        isRunning: true,
                        testRecordId: this.runningTestInfo.testRecordId,
                        tester: this.runningTestInfo.tester,
                    });
                }
            }
            else {
                resolve({
                    isRunning: false,
                });
            }
        });
    }
    startTest(param, sessionId) {
        console.log('sessionId', sessionId);
        return new Promise(async (resolve, reject) => {
            try {
                const { isRunning, testRecordId } = await this.checkTestRunning(sessionId);
                if (isRunning) {
                    reject({
                        status: common_1.HttpStatus.BAD_REQUEST,
                        data: {
                            message: `이미 테스트 중입니다. testRecordId: ${testRecordId}`,
                        },
                    });
                    return;
                }
                this.runningTestInfo = {
                    tester: param.tester,
                    testSessionId: sessionId,
                    testRecordId: param.testRecordId,
                    testEndTimestamp: Date.now() + 1000 * 60 * 5,
                };
                this.observeTestRunning();
                resolve(this.runningTestInfo);
            }
            catch (error) {
                http_logger_1.default.error(`[TEST] startTest : ${(0, error_util_1.errorToJson)(error)}`);
                reject({
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    data: {
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                        error: error,
                    },
                });
            }
        });
    }
    endTest(sessionId) {
        return new Promise(async (resolve, reject) => {
            try {
                const { isRunning } = await this.checkTestRunning(sessionId);
                if (!isRunning) {
                    reject({
                        status: common_1.HttpStatus.BAD_REQUEST,
                        data: {
                            message: '테스트 시작 API를 통해 테스트를 시작하지 않았습니다. 테스트 시작 API를 통해 테스트를 시작하세요.',
                        },
                    });
                    return;
                }
                this.runningTestInfo = null;
                resolve({ result: true });
            }
            catch (error) {
                http_logger_1.default.error(`[TEST] endTest : ${(0, error_util_1.errorToJson)(error)}`);
                reject({
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    data: {
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                        error: error,
                    },
                });
            }
        });
    }
};
exports.TestService = TestService;
exports.TestService = TestService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(test_entity_1.TestEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(test_entity_1.TestRecordEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TestService);
//# sourceMappingURL=test.service.js.map