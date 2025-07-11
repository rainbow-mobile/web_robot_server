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
exports.AlarmLogEntity = void 0;
const typeorm_1 = require("typeorm");
let AlarmLogEntity = class AlarmLogEntity {
};
exports.AlarmLogEntity = AlarmLogEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AlarmLogEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'alarmCode', type: 'varchar' }),
    __metadata("design:type", String)
], AlarmLogEntity.prototype, "alarmCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'state' }),
    __metadata("design:type", Boolean)
], AlarmLogEntity.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'emitFlag' }),
    __metadata("design:type", Boolean)
], AlarmLogEntity.prototype, "emitFlag", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'time',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], AlarmLogEntity.prototype, "time", void 0);
exports.AlarmLogEntity = AlarmLogEntity = __decorate([
    (0, typeorm_1.Entity)('alarmLog')
], AlarmLogEntity);
//# sourceMappingURL=alarmlog.entity.js.map