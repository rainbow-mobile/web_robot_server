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
exports.StatusImuEntity = void 0;
const typeorm_1 = require("typeorm");
class StatusImuEntity {
}
exports.StatusImuEntity = StatusImuEntity;
__decorate([
    (0, typeorm_1.Column)({ name: 'acc_x', type: 'double' }),
    __metadata("design:type", Number)
], StatusImuEntity.prototype, "acc_x", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'acc_y', type: 'double' }),
    __metadata("design:type", Number)
], StatusImuEntity.prototype, "acc_y", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'acc_z', type: 'double' }),
    __metadata("design:type", Number)
], StatusImuEntity.prototype, "acc_z", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gyr_x', type: 'double' }),
    __metadata("design:type", Number)
], StatusImuEntity.prototype, "gyr_x", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gyr_y', type: 'double' }),
    __metadata("design:type", Number)
], StatusImuEntity.prototype, "gyr_y", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gyr_z', type: 'double' }),
    __metadata("design:type", Number)
], StatusImuEntity.prototype, "gyr_z", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'imu_rx', type: 'double' }),
    __metadata("design:type", Number)
], StatusImuEntity.prototype, "imu_rx", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'imu_ry', type: 'double' }),
    __metadata("design:type", Number)
], StatusImuEntity.prototype, "imu_ry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'imu_rz', type: 'double' }),
    __metadata("design:type", Number)
], StatusImuEntity.prototype, "imu_rz", void 0);
//# sourceMappingURL=imu.entity.js.map