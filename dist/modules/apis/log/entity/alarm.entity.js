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
exports.AlarmEntity = void 0;
const typeorm_1 = require("typeorm");
let AlarmEntity = class AlarmEntity {
};
exports.AlarmEntity = AlarmEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'alarmCode', type: 'varchar', unique: true }),
    __metadata("design:type", String)
], AlarmEntity.prototype, "alarmCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'alarmDetail', type: 'varchar' }),
    __metadata("design:type", String)
], AlarmEntity.prototype, "alarmDetail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'operationName', type: 'varchar' }),
    __metadata("design:type", String)
], AlarmEntity.prototype, "operationName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'alarmDescription', type: 'varchar' }),
    __metadata("design:type", String)
], AlarmEntity.prototype, "alarmDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'isError', type: 'tinyint' }),
    __metadata("design:type", Boolean)
], AlarmEntity.prototype, "isError", void 0);
exports.AlarmEntity = AlarmEntity = __decorate([
    (0, typeorm_1.Entity)('alarm')
], AlarmEntity);
//# sourceMappingURL=alarm.entity.js.map