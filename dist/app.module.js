"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const users_module_1 = require("./modules/apis/users/users.module");
const sockets_module_1 = require("./modules/sockets/sockets.module");
const task_module_1 = require("./modules/apis/task/task.module");
const config_1 = require("@nestjs/config");
const move_module_1 = require("./modules/apis/move/move.module");
const control_module_1 = require("./modules/apis/control/control.module");
const map_module_1 = require("./modules/apis/map/map.module");
const process_module_1 = require("./modules/apis/process/process.module");
const setting_module_1 = require("./modules/apis/setting/setting.module");
const variables_module_1 = require("./modules/apis/variables/variables.module");
const network_module_1 = require("./modules/apis/network/network.module");
const log_module_1 = require("./modules/apis/log/log.module");
const schedule_1 = require("@nestjs/schedule");
const upload_module_1 = require("./modules/apis/upload/upload.module");
const sound_module_1 = require("./modules/apis/sound/sound.module");
const onvif_module_1 = require("./modules/apis/onvif/onvif.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            schedule_1.ScheduleModule.forRoot(),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: () => ({
                    type: 'mariadb',
                    host: process.env.DB_HOST || '127.0.0.1',
                    port: 3306,
                    username: process.env.DB_USER || 'rainbow',
                    password: process.env.DB_PASSWORD || 'rainbow',
                    database: process.env.DB_DATABASE || 'rainbow_rrs',
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    logging: false,
                }),
            }),
            users_module_1.UsersModule,
            sockets_module_1.SocketsModule,
            task_module_1.TaskModule,
            control_module_1.ControlModule,
            move_module_1.MoveModule,
            map_module_1.MapModule,
            setting_module_1.SettingModule,
            process_module_1.ProcessModule,
            variables_module_1.VariablesModule,
            network_module_1.NetworkModule,
            log_module_1.LogModule,
            upload_module_1.UploadModule,
            sound_module_1.SoundModule,
            onvif_module_1.OnvifDeviceModule,
        ],
        providers: [],
        controllers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map