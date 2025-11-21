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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestEntity = exports.TestRecordEntity = exports.TestResult = void 0;
const typeorm_1 = require("typeorm");
var TestResult;
(function (TestResult) {
    TestResult["SUCCESS"] = "SUCCESS";
    TestResult["FAIL"] = "FAIL";
})(TestResult || (exports.TestResult = TestResult = {}));
let TestRecordEntity = class TestRecordEntity {
};
exports.TestRecordEntity = TestRecordEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TestRecordEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tester',
        type: 'varchar',
        length: 128,
    }),
    __metadata("design:type", String)
], TestRecordEntity.prototype, "tester", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'createdAt',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], TestRecordEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'updatedAt',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], TestRecordEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => TestEntity, (test) => test.testRecord),
    __metadata("design:type", Array)
], TestRecordEntity.prototype, "tests", void 0);
exports.TestRecordEntity = TestRecordEntity = __decorate([
    (0, typeorm_1.Entity)('test_record')
], TestRecordEntity);
let TestEntity = class TestEntity {
};
exports.TestEntity = TestEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TestEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'test_record_id',
        type: 'int',
    }),
    __metadata("design:type", Number)
], TestEntity.prototype, "testRecordId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TestRecordEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'test_record_id' }),
    __metadata("design:type", TestRecordEntity)
], TestEntity.prototype, "testRecord", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'subject',
        type: 'varchar',
        length: 128,
    }),
    __metadata("design:type", String)
], TestEntity.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'result',
        type: 'enum',
        enum: TestResult,
        nullable: true,
        default: null,
    }),
    __metadata("design:type", String)
], TestEntity.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'testAt',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], TestEntity.prototype, "testAt", void 0);
exports.TestEntity = TestEntity = __decorate([
    (0, typeorm_1.Entity)('test')
], TestEntity);
//# sourceMappingURL=test.entity.js.map