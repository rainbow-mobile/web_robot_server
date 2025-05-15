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
exports.StatusLogEntity = void 0;
const typeorm_1 = require("typeorm");
const condition_entity_1 = require("./status/condition.entity");
const state_entity_1 = require("./status/state.entity");
const motor_entity_1 = require("./status/motor.entity");
const imu_entity_1 = require("./status/imu.entity");
const power_entity_1 = require("./status/power.entity");
const pos_entity_1 = require("./status/pos.entity");
const task_entity_1 = require("./status/task.entity");
let StatusLogEntity = class StatusLogEntity {
};
exports.StatusLogEntity = StatusLogEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'time', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], StatusLogEntity.prototype, "time", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'slam', type: 'boolean' }),
    __metadata("design:type", Boolean)
], StatusLogEntity.prototype, "slam", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type', type: 'varchar', length: 32 }),
    __metadata("design:type", String)
], StatusLogEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conditions', type: 'json' }),
    __metadata("design:type", condition_entity_1.StatusConditionEntity)
], StatusLogEntity.prototype, "conditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'robot_state', type: 'json' }),
    __metadata("design:type", state_entity_1.StatusStateEntity)
], StatusLogEntity.prototype, "robot_state", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'move_state', type: 'json' }),
    __metadata("design:type", state_entity_1.StatusStateEntity)
], StatusLogEntity.prototype, "move_state", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'motor0', type: 'json' }),
    __metadata("design:type", motor_entity_1.StatusMotorEntity)
], StatusLogEntity.prototype, "motor0", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'motor1', type: 'json' }),
    __metadata("design:type", motor_entity_1.StatusMotorEntity)
], StatusLogEntity.prototype, "motor1", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'imu', type: 'json' }),
    __metadata("design:type", imu_entity_1.StatusImuEntity)
], StatusLogEntity.prototype, "imu", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'power', type: 'json' }),
    __metadata("design:type", power_entity_1.StatusPowerEntity)
], StatusLogEntity.prototype, "power", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pose', type: 'json' }),
    __metadata("design:type", pos_entity_1.StatusPosEntity)
], StatusLogEntity.prototype, "pose", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'task', type: 'json' }),
    __metadata("design:type", task_entity_1.StatusTaskEntity)
], StatusLogEntity.prototype, "task", void 0);
exports.StatusLogEntity = StatusLogEntity = __decorate([
    (0, typeorm_1.Entity)('status')
], StatusLogEntity);
//# sourceMappingURL=status.emit.entity.js.map