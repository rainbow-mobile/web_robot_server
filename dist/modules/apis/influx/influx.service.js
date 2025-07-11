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
exports.InfluxDBService = void 0;
const common_1 = require("@nestjs/common");
const influxdb3_client_1 = require("@influxdata/influxdb3-client");
const dotenv = require("dotenv");
const http_logger_1 = require("../../../common/logger/http.logger");
const error_util_1 = require("../../../common/util/error.util");
dotenv.config();
let InfluxDBService = class InfluxDBService {
    constructor() {
        this.database = 'status';
        const host = 'http://127.0.0.1:8181';
        const token = '';
        this.bucket = process.env.INFLUX_BUCKET;
        this.org = process.env.INFLUX_ORG;
        this.client = new influxdb3_client_1.InfluxDBClient({ host, token });
    }
    async writeData() {
        const point = influxdb3_client_1.Point.measurement('home')
            .setTag('room', 'Rainbow')
            .setFloatField('temp', '22.2')
            .setTimestamp(new Date());
        try {
            const result = await this.client.write([point], this.database, '', {
                precision: 'ms',
            });
            console.log(result);
            console.log('Data has been written successfully!');
        }
        catch (error) {
            console.error(`Error writing data to InfluxDB: ${error.body}`);
        }
    }
    async testStatus(time) {
        try {
            const batteryPoint = influxdb3_client_1.Point.measurement('battery')
                .setTag('type', 'SIMUL')
                .setFloatField('battery_in', 0)
                .setFloatField('battery_out', 0)
                .setFloatField('battery_current', 0)
                .setFloatField('battery_percent', 0);
            const result = await this.client.write([batteryPoint], this.database, '', { precision: 'ns' });
            console.log(`Test ${time} Data has been written successfully!`);
        }
        catch (error) {
            http_logger_1.default.error(`[INFLUX] writeStatus : ${(0, error_util_1.errorToJson)(error)}`);
        }
    }
    async writeMoveStatus(status) {
        try {
            const type = 'SIMUL';
            const posePoint = influxdb3_client_1.Point.measurement('pose')
                .setTag('type', type)
                .setFloatField('x', parseFloat(status.pose.x))
                .setFloatField('y', parseFloat(status.pose.y))
                .setFloatField('rz', parseFloat(status.pose.rz))
                .setFloatField('vx', parseFloat(status.vel.vx))
                .setFloatField('vy', parseFloat(status.vel.vy))
                .setFloatField('wz', parseFloat(status.vel.wz));
            const moveStatePoint = influxdb3_client_1.Point.measurement('move_state')
                .setTag('type', type)
                .setStringField('auto_move', status.move_state.auto_move)
                .setStringField('jog_move', status.move_state.jog_move)
                .setStringField('dock_move', status.move_state.dock_move)
                .setStringField('obs', status.move_state.obs)
                .setStringField('path', status.move_state.path);
            const goalPoint = influxdb3_client_1.Point.measurement('goal_node')
                .setTag('type', type)
                .setStringField('id', status.goal_node.id)
                .setStringField('name', status.goal_node.name)
                .setStringField('state', status.goal_node.state)
                .setFloatField('x', parseFloat(status.goal_node.x))
                .setFloatField('y', parseFloat(status.goal_node.y))
                .setFloatField('rz', parseFloat(status.goal_node.rz));
            const curPoint = influxdb3_client_1.Point.measurement('cur_node')
                .setTag('type', type)
                .setStringField('id', status.cur_node.id)
                .setStringField('name', status.cur_node.name)
                .setFloatField('x', parseFloat(status.cur_node.x))
                .setFloatField('y', parseFloat(status.cur_node.y))
                .setFloatField('rz', parseFloat(status.cur_node.rz));
            const result = await this.client.write([posePoint, moveStatePoint, goalPoint, curPoint], this.database, '', { precision: 'ns' });
        }
        catch (error) {
            http_logger_1.default.error(`[INFLUX] writeStatus : ${(0, error_util_1.errorToJson)(error)}`);
        }
    }
    async writeStatus(status) {
        try {
            const type = 'SIMUL';
            const batteryPoint = influxdb3_client_1.Point.measurement('battery')
                .setTag('type', type)
                .setFloatField('battery_in', parseFloat(status.power.bat_in))
                .setFloatField('battery_out', parseFloat(status.power.bat_out))
                .setFloatField('battery_current', parseFloat(status.power.bat_current))
                .setFloatField('battery_percent', parseFloat(status.power.bat_percent));
            const powerPoint = influxdb3_client_1.Point.measurement('power')
                .setTag('type', type)
                .setFloatField('power', parseFloat(status.power.power))
                .setFloatField('total_power', parseFloat(status.power.total_power))
                .setFloatField('charge_current', parseFloat(status.power.charge_current))
                .setFloatField('contact_voltage', parseFloat(status.power.contact_voltage));
            const conditionPoint = influxdb3_client_1.Point.measurement('condition')
                .setTag('type', type)
                .setFloatField('inlier_ratio', parseFloat(status.condition.inlier_ratio))
                .setFloatField('inlier_error', parseFloat(status.condition.inlier_error))
                .setFloatField('mapping_ratio', parseFloat(status.condition.mapping_ratio))
                .setFloatField('mapping_error', parseFloat(status.condition.mapping_error));
            const imuPoint = influxdb3_client_1.Point.measurement('imu')
                .setTag('type', type)
                .setFloatField('imu_rx', parseFloat(status.imu.imu_rx))
                .setFloatField('imu_ry', parseFloat(status.imu.imu_ry))
                .setFloatField('imu_rz', parseFloat(status.imu.imu_rz))
                .setFloatField('gyr_x', parseFloat(status.imu.gyr_x))
                .setFloatField('gyr_y', parseFloat(status.imu.gyr_y))
                .setFloatField('gyr_z', parseFloat(status.imu.gyr_z))
                .setFloatField('acc_x', parseFloat(status.imu.acc_x))
                .setFloatField('acc_y', parseFloat(status.imu.acc_y))
                .setFloatField('acc_z', parseFloat(status.imu.acc_z));
            const statePoint = influxdb3_client_1.Point.measurement('robot_state')
                .setTag('type', type)
                .setStringField('charge', status.robot_state.charge)
                .setStringField('localization', status.robot_state.localization)
                .setStringField('dock', status.robot_state.dock)
                .setStringField('emo', status.robot_state.emo)
                .setStringField('power', status.robot_state.power)
                .setStringField('map_name', status.map.map_name)
                .setStringField('map_status', status.map.map_status);
            const motorLeftPoint = influxdb3_client_1.Point.measurement('motor_left')
                .setTag('type', type)
                .setStringField('connection', status.motor[1].connection)
                .setFloatField('current', parseFloat(status.motor[1].current))
                .setIntegerField('status', parseInt(status.motor[1].status))
                .setFloatField('temperature', parseFloat(status.motor[1].temp));
            const motorRightPoint = influxdb3_client_1.Point.measurement('motor_right')
                .setTag('type', type)
                .setStringField('connection', status.motor[0].connection)
                .setFloatField('current', parseFloat(status.motor[0].current))
                .setIntegerField('status', parseInt(status.motor[0].status))
                .setFloatField('temperature', parseFloat(status.motor[0].temp));
            const result = await this.client.write([
                batteryPoint,
                powerPoint,
                conditionPoint,
                imuPoint,
                statePoint,
                motorLeftPoint,
                motorRightPoint,
            ], this.database, '', { precision: 'ns' });
        }
        catch (error) {
            http_logger_1.default.error(`[INFLUX] writeStatus : ${(0, error_util_1.errorToJson)(error)}`);
        }
    }
    async queryData(database, table) {
        return new Promise(async (resolve, reject) => {
            try {
                const result = this.client.queryPoints(`SELECT * FROM ${table}`, database);
                const array = [];
                for await (const point of result) {
                    array.push(point);
                }
                console.log(array);
                resolve(array);
            }
            catch (error) {
                http_logger_1.default.error(`[INFLUX] queryData : ${(0, error_util_1.errorToJson)(error)}`);
                console.error(error);
                reject();
            }
        });
    }
};
exports.InfluxDBService = InfluxDBService;
exports.InfluxDBService = InfluxDBService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], InfluxDBService);
//# sourceMappingURL=influx.service.js.map