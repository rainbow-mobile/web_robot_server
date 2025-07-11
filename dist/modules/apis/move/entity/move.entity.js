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
exports.MoveLogEntity = void 0;
const typeorm_1 = require("typeorm");
let MoveLogEntity = class MoveLogEntity {
};
exports.MoveLogEntity = MoveLogEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MoveLogEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'command' }),
    __metadata("design:type", String)
], MoveLogEntity.prototype, "command", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'goal_id' }),
    __metadata("design:type", String)
], MoveLogEntity.prototype, "goal_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'map_name' }),
    __metadata("design:type", String)
], MoveLogEntity.prototype, "map_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'goal_name' }),
    __metadata("design:type", String)
], MoveLogEntity.prototype, "goal_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'x', type: 'float' }),
    __metadata("design:type", Number)
], MoveLogEntity.prototype, "x", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'y', type: 'float' }),
    __metadata("design:type", Number)
], MoveLogEntity.prototype, "y", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rz', type: 'float' }),
    __metadata("design:type", Number)
], MoveLogEntity.prototype, "rz", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'time',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], MoveLogEntity.prototype, "time", void 0);
exports.MoveLogEntity = MoveLogEntity = __decorate([
    (0, typeorm_1.Entity)('move')
], MoveLogEntity);
