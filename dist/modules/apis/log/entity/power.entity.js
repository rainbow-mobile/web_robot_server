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
exports.PowerLogEntity = void 0;
const typeorm_1 = require("typeorm");
let PowerLogEntity = class PowerLogEntity {
};
exports.PowerLogEntity = PowerLogEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'time', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], PowerLogEntity.prototype, "time", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'battery_in', type: 'double' }),
    __metadata("design:type", Number)
], PowerLogEntity.prototype, "battery_in", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'battery_out', type: 'double' }),
    __metadata("design:type", Number)
], PowerLogEntity.prototype, "battery_out", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'battery_current', type: 'double' }),
    __metadata("design:type", Number)
], PowerLogEntity.prototype, "battery_current", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'power', type: 'double' }),
    __metadata("design:type", Number)
], PowerLogEntity.prototype, "power", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_power', type: 'double' }),
    __metadata("design:type", Number)
], PowerLogEntity.prototype, "total_power", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'motor0_temp', type: 'double' }),
    __metadata("design:type", Number)
], PowerLogEntity.prototype, "motor0_temp", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'motor0_current', type: 'double' }),
    __metadata("design:type", Number)
], PowerLogEntity.prototype, "motor0_current", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'motor0_status', type: 'int' }),
    __metadata("design:type", Number)
], PowerLogEntity.prototype, "motor0_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'motor1_temp', type: 'double' }),
    __metadata("design:type", Number)
], PowerLogEntity.prototype, "motor1_temp", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'motor1_current', type: 'double' }),
    __metadata("design:type", Number)
], PowerLogEntity.prototype, "motor1_current", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'motor1_status', type: 'int' }),
    __metadata("design:type", Number)
], PowerLogEntity.prototype, "motor1_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'charge_current', type: 'double' }),
    __metadata("design:type", Number)
], PowerLogEntity.prototype, "charge_current", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contact_voltage', type: 'double' }),
    __metadata("design:type", Number)
], PowerLogEntity.prototype, "contact_voltage", void 0);
exports.PowerLogEntity = PowerLogEntity = __decorate([
    (0, typeorm_1.Entity)('power')
], PowerLogEntity);
//# sourceMappingURL=power.entity.js.map