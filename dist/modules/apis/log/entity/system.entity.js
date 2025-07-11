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
exports.SystemLogEntity = void 0;
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
let SystemLogEntity = class SystemLogEntity {
};
exports.SystemLogEntity = SystemLogEntity;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: new Date(),
    }),
    (0, typeorm_1.PrimaryColumn)({
        name: 'time',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], SystemLogEntity.prototype, "time", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 0,
        description: 'CPU 총 사용량(%)',
    }),
    (0, typeorm_1.Column)({ name: 'cpu', type: 'float' }),
    __metadata("design:type", Number)
], SystemLogEntity.prototype, "cpu", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 0,
        description: 'CPU 코어 별 사용량(%)',
    }),
    (0, typeorm_1.Column)({ name: 'cpu_cores', type: 'json' }),
    __metadata("design:type", Array)
], SystemLogEntity.prototype, "cpu_cores", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 0,
        description: '메모리 총량 (GB)',
    }),
    (0, typeorm_1.Column)({ name: 'memory_total', type: 'float' }),
    __metadata("design:type", Number)
], SystemLogEntity.prototype, "memory_total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 0,
        description: '메모리 여분량 (GB)',
    }),
    (0, typeorm_1.Column)({ name: 'memory_free', type: 'float' }),
    __metadata("design:type", Number)
], SystemLogEntity.prototype, "memory_free", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [],
        description: '네트워크 사용량',
    }),
    (0, typeorm_1.Column)({ name: 'network', type: 'json' }),
    __metadata("design:type", Object)
], SystemLogEntity.prototype, "network", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [],
        description: 'RRS 시스템자원 사용량',
    }),
    (0, typeorm_1.Column)({ name: 'server', type: 'json' }),
    __metadata("design:type", Object)
], SystemLogEntity.prototype, "server", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [],
        description: 'RRS UI 시스템자원 사용량',
    }),
    (0, typeorm_1.Column)({ name: 'webui', type: 'json' }),
    __metadata("design:type", Object)
], SystemLogEntity.prototype, "webui", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [],
        description: 'SLAMNAV2 시스템자원 사용량',
    }),
    (0, typeorm_1.Column)({ name: 'slamnav', type: 'json' }),
    __metadata("design:type", Object)
], SystemLogEntity.prototype, "slamnav", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: [],
        description: 'TaskMan 시스템자원 사용량',
    }),
    (0, typeorm_1.Column)({ name: 'taskman', type: 'json' }),
    __metadata("design:type", Object)
], SystemLogEntity.prototype, "taskman", void 0);
exports.SystemLogEntity = SystemLogEntity = __decorate([
    (0, typeorm_1.Entity)('system')
], SystemLogEntity);
