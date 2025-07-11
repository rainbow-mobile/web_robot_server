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
exports.StateLogEntity = void 0;
const typeorm_1 = require("typeorm");
let StateLogEntity = class StateLogEntity {
};
exports.StateLogEntity = StateLogEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        name: 'time',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], StateLogEntity.prototype, "time", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'state', type: 'varchar', length: 32 }),
    __metadata("design:type", String)
], StateLogEntity.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'auto_state', type: 'varchar', length: 32 }),
    __metadata("design:type", String)
], StateLogEntity.prototype, "auto_state", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'localization', type: 'varchar', length: 32 }),
    __metadata("design:type", String)
], StateLogEntity.prototype, "localization", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'obs_state', type: 'varchar', length: 32 }),
    __metadata("design:type", String)
], StateLogEntity.prototype, "obs_state", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'charging', type: 'varchar', length: 32 }),
    __metadata("design:type", String)
], StateLogEntity.prototype, "charging", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'power', type: 'tinyint' }),
    __metadata("design:type", Boolean)
], StateLogEntity.prototype, "power", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'emo', type: 'tinyint' }),
    __metadata("design:type", Boolean)
], StateLogEntity.prototype, "emo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dock', type: 'tinyint' }),
    __metadata("design:type", Boolean)
], StateLogEntity.prototype, "dock", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'inlier_ratio', type: 'double' }),
    __metadata("design:type", Number)
], StateLogEntity.prototype, "inlier_ratio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'inlier_error', type: 'double' }),
    __metadata("design:type", Number)
], StateLogEntity.prototype, "inlier_error", void 0);
exports.StateLogEntity = StateLogEntity = __decorate([
    (0, typeorm_1.Entity)('state')
], StateLogEntity);
