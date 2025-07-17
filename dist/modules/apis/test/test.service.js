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
    constructor(testRepository) {
        this.testRepository = testRepository;
        this.checkTestTable();
    }
    checkTestTable() {
        return this.testRepository.query(`
      CREATE TABLE IF NOT EXISTS test (
        id INT AUTO_INCREMENT PRIMARY KEY,
        subject VARCHAR(128),
        result VARCHAR(128),
        init_tester VARCHAR(128),
        testAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    }
    upsertTestResult(updateTestDataDto) {
        return new Promise(async (resolve, reject) => {
            try {
                const test = this.testRepository.create(updateTestDataDto);
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
    getRecentTestResultBySubject({ subjects, }) {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await this.testRepository
                    .createQueryBuilder('test')
                    .where('test.subject IN (:...subjects)', { subjects })
                    .andWhere((qb) => {
                    const subQuery = qb
                        .subQuery()
                        .select('t2.id')
                        .from(test_entity_1.TestEntity, 't2')
                        .where('t2.subject = test.subject')
                        .orderBy('t2.testAt', 'DESC')
                        .limit(1)
                        .getQuery();
                    return 'test.id = ' + subQuery;
                })
                    .orderBy('test.testAt', 'DESC')
                    .getMany();
                resolve({
                    items: result,
                });
            }
            catch (error) {
                http_logger_1.default.error(`[TEST] getTestResult : ${(0, error_util_1.errorToJson)(error)}`);
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
    getTestResultAll(param) {
        return new Promise(async (resolve, reject) => {
            try {
                const queryBuilder = this.testRepository.createQueryBuilder('test');
                if (param.startDt) {
                    const startDate = new Date(param.startDt);
                    startDate.setHours(0, 0, 0, 0);
                    queryBuilder.andWhere('test.testAt >= :startDt', {
                        startDt: startDate,
                    });
                }
                if (param.endDt) {
                    const endDate = new Date(param.endDt);
                    endDate.setHours(23, 59, 59, 999);
                    queryBuilder.andWhere('test.testAt <= :endDt', { endDt: endDate });
                }
                if (param.subject && param.subject.length > 0) {
                    queryBuilder.andWhere('test.subject IN (:...subjects)', {
                        subjects: param.subject,
                    });
                }
                if (param.initTester) {
                    queryBuilder.andWhere('test.init_tester LIKE :initTester', {
                        initTester: `%${param.initTester}%`,
                    });
                }
                if (!param.pageNo) {
                    const items = await queryBuilder.getMany();
                    const totalCount = items.length;
                    resolve({
                        totalCount,
                        items,
                    });
                    return;
                }
                queryBuilder.orderBy('test.testAt', param.orderBy);
                const totalCount = await queryBuilder.getCount();
                const items = await queryBuilder
                    .skip(param.getOffset())
                    .take(param.getLimit())
                    .getMany();
                resolve(new pagination_response_1.PaginationResponse(totalCount, param.getLimit(), items));
            }
            catch (error) {
                http_logger_1.default.error(`[TEST] getTestResultAll : ${(0, error_util_1.errorToJson)(error)}`);
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
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TestService);
//# sourceMappingURL=test.service.js.map