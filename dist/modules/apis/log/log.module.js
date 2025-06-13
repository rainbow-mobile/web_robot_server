"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogModule = void 0;
const common_1 = require("@nestjs/common");
const log_service_1 = require("./log.service");
const log_controller_1 = require("./log.controller");
const typeorm_1 = require("@nestjs/typeorm");
const state_entity_1 = require("./entity/state.entity");
const power_entity_1 = require("./entity/power.entity");
const status_entity_1 = require("./entity/status.entity");
const system_entity_1 = require("./entity/system.entity");
const alarm_entity_1 = require("./entity/alarm.entity");
const alarmlog_entity_1 = require("./entity/alarmlog.entity");
let LogModule = class LogModule {
};
exports.LogModule = LogModule;
exports.LogModule = LogModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                state_entity_1.StateLogEntity,
                power_entity_1.PowerLogEntity,
                status_entity_1.StatusLogEntity,
                system_entity_1.SystemLogEntity,
                alarm_entity_1.AlarmEntity,
                alarmlog_entity_1.AlarmLogEntity
            ])
        ],
        controllers: [log_controller_1.LogController],
        providers: [log_service_1.LogService],
        exports: [log_service_1.LogService]
    })
], LogModule);
//# sourceMappingURL=log.module.js.map