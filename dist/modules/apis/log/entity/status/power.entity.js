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
exports.StatusPowerEntity = void 0;
const typeorm_1 = require("typeorm");
class StatusPowerEntity {
}
exports.StatusPowerEntity = StatusPowerEntity;
__decorate([
    (0, typeorm_1.Column)({ name: 'bat_in', type: 'double' }),
    __metadata("design:type", Number)
], StatusPowerEntity.prototype, "bat_in", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bat_out', type: 'double' }),
    __metadata("design:type", Number)
], StatusPowerEntity.prototype, "bat_out", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bat_current', type: 'double' }),
    __metadata("design:type", Number)
], StatusPowerEntity.prototype, "bat_current", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'power', type: 'double' }),
    __metadata("design:type", Number)
], StatusPowerEntity.prototype, "power", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_power', type: 'double' }),
    __metadata("design:type", Number)
], StatusPowerEntity.prototype, "total_power", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'charge_current', type: 'double' }),
    __metadata("design:type", Number)
], StatusPowerEntity.prototype, "charge_current", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contact_voltage', type: 'double' }),
    __metadata("design:type", Number)
], StatusPowerEntity.prototype, "contact_voltage", void 0);
