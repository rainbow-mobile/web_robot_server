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
exports.TestEntity = exports.TestResult = exports.SubjectEnum = void 0;
const typeorm_1 = require("typeorm");
var SubjectEnum;
(function (SubjectEnum) {
    SubjectEnum["DISPLAY"] = "DISPLAY";
    SubjectEnum["SPEAKER"] = "SPEAKER";
    SubjectEnum["CAMERA"] = "CAMERA";
    SubjectEnum["CHARGER"] = "CHARGER";
    SubjectEnum["MAP_MOVE"] = "MAP_MOVE";
})(SubjectEnum || (exports.SubjectEnum = SubjectEnum = {}));
var TestResult;
(function (TestResult) {
    TestResult["SUCCESS"] = "SUCCESS";
    TestResult["FAIL"] = "FAIL";
})(TestResult || (exports.TestResult = TestResult = {}));
let TestEntity = class TestEntity {
};
exports.TestEntity = TestEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TestEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'subject',
        type: 'enum',
        enum: SubjectEnum,
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
        name: 'init_tester',
        type: 'varchar',
        length: 128,
        nullable: true,
        default: null,
    }),
    __metadata("design:type", String)
], TestEntity.prototype, "initTester", void 0);
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