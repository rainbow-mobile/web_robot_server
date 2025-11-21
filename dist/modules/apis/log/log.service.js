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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const typeorm_2 = require("typeorm");
const moment = require("moment");
const http_logger_1 = require("../../../common/logger/http.logger");
const http_status_messages_constants_1 = require("../../../common/constants/http-status-messages.constants");
const typeorm_3 = require("typeorm");
const status_entity_1 = require("./entity/status.entity");
const Query = require("../../../common/interface/db/query");
const path = require("path");
const fs = require("fs");
const readline = require("readline");
const os = require("os");
const AdmZip = require("adm-zip");
const date_util_1 = require("../../../common/util/date.util");
const pagination_response_1 = require("../../../common/pagination/pagination.response");
const error_util_1 = require("../../../common/util/error.util");
const si = require("systeminformation");
const child_process_1 = require("child_process");
const system_entity_1 = require("./entity/system.entity");
const config_1 = require("@nestjs/config");
let LogService = class LogService {
    constructor(statusRepository, systemRepository, dataSource, configService) {
        this.statusRepository = statusRepository;
        this.systemRepository = systemRepository;
        this.dataSource = dataSource;
        this.configService = configService;
        this.systemUsage = null;
        this.networkUsage = null;
        this.previousStats = {};
        this.previousTime = new Date();
        console.log('log constructor');
        this.init();
        setInterval(() => {
            this.readMemoryUsage();
        }, 500);
    }
    async init() {
        await this.checkTables('variables', Query.create_variables);
        this.checkTables('status', Query.create_status);
        this.checkTables('move', Query.create_move);
        this.checkTables('system', Query.create_system);
    }
    async addDisconForGaps(filteredArray) {
        const result = [];
        for (let i = 0; i < filteredArray.length; i++) {
            result.push({
                time: filteredArray[i].time,
                value: filteredArray[i].value,
            });
            if (i < filteredArray.length) {
                const currentEndTime = filteredArray[i].time.getTime();
                const nextStartTime = i == filteredArray.length - 1
                    ? new Date().getTime()
                    : new Date(filteredArray[i + 1].time).getTime();
                const gap = (nextStartTime - currentEndTime) / 1000;
                if (gap > 20) {
                    if (typeof filteredArray[i].value == 'string') {
                        const disconEntry = {
                            time: new Date(currentEndTime + 10),
                            value: 'Discon',
                        };
                        result.push(disconEntry);
                    }
                    else if (typeof filteredArray[i].value == 'boolean') {
                        const disconEntry = {
                            time: new Date(currentEndTime + 10),
                            value: false,
                        };
                        result.push(disconEntry);
                    }
                    else {
                        const disconEntry = {
                            time: new Date(currentEndTime + 10),
                            value: 0,
                        };
                        result.push(disconEntry);
                    }
                }
            }
        }
        if (result.length > 0) {
            if (typeof result[0].value == 'string') {
                const finalEntry = {
                    time: new Date(),
                    value: 'Final',
                };
                result.push(finalEntry);
            }
            else if (typeof result[0].value == 'boolean') {
                const finalEntry = {
                    time: new Date(),
                    value: false,
                };
                result.push(finalEntry);
            }
            else {
                const finalEntry = {
                    time: new Date(),
                    value: 0,
                };
                result.push(finalEntry);
            }
        }
        return result.map((data) => ({
            time: date_util_1.DateUtil.formatDateYYYYMMbDDsHHcMIcSSZZZ(data.time),
            value: data.value,
        }));
    }
    async getStatusParam(key) {
        return new Promise(async (resolve, reject) => {
            try {
                http_logger_1.default.debug(`[LOG] getStatusParam : ${key}`);
                const today = new Date();
                const midnightUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
                const data = await this.statusRepository
                    .createQueryBuilder()
                    .where('time >= :midnightUTC', {
                    midnightUTC: midnightUTC,
                })
                    .getMany();
                let newDataMap;
                if (key.split('/').length > 1) {
                    newDataMap = data.map((data) => ({
                        time: data.time,
                        value: data[key.split('/')[0]][key.split('/')[1]],
                    }));
                }
                else {
                    newDataMap = data.map((data) => ({
                        time: data.time,
                        value: data[key],
                    }));
                }
                const finalArray = await this.addDisconForGaps(newDataMap);
                const filteredChanges = finalArray.filter((item, index, arr) => {
                    if (index === 0)
                        return true;
                    return item.value !== arr[index - 1].value;
                });
                resolve(filteredChanges);
            }
            catch (error) {
                http_logger_1.default.error(`[LOG] getStateState Error : ${(0, error_util_1.errorToJson)(error)}`);
                reject({
                    data: {
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                    },
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                });
            }
        });
    }
    async getStatusLog(key) {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await this.statusRepository.find();
                const calculateGapTime = (prev, next) => {
                    const gap = (next - prev) / 1000;
                    return gap;
                };
                const addDisconForGaps = (filteredArray) => {
                    const result = [];
                    for (let i = 0; i < filteredArray.length; i++) {
                        result.push({
                            time: moment(filteredArray[i].time),
                            value: filteredArray[i].value,
                        });
                        if (i < filteredArray.length - 1) {
                            const currentEndTime = moment(filteredArray[i].time).valueOf();
                            const nextStartTime = moment(filteredArray[i + 1].time).valueOf();
                            const gap = (nextStartTime - currentEndTime) / 1000;
                            if (gap > 20) {
                                const disconEntry = {
                                    time: moment(currentEndTime / 1000 + 10),
                                    value: 0,
                                };
                                result.push(disconEntry);
                                const disconEntry2 = {
                                    time: moment(nextStartTime / 1000 - 10),
                                    value: 0,
                                };
                                result.push(disconEntry2);
                            }
                        }
                    }
                    const curTime = moment();
                    if (result.length > 0) {
                        if (calculateGapTime(result[result.length - 1].time, curTime) > 20) {
                            const finalEntry = {
                                time: moment.unix(result[result.length - 1].time.unix() + 10),
                                value: 0,
                            };
                            result.push(finalEntry);
                            const curEntry = {
                                time: curTime,
                                value: 0,
                            };
                            result.push(curEntry);
                        }
                    }
                    else {
                        const finalEntry = {
                            time: moment.unix(curTime.unix() - 60 * 12),
                            value: 0,
                        };
                        result.push(finalEntry);
                        const curEntry = {
                            time: curTime,
                            value: 0,
                        };
                        result.push(curEntry);
                    }
                    if (result.length > 0) {
                        const finalEntry = {
                            time: moment.unix(result[result.length - 1].time.unix() + 10),
                            value: 0,
                        };
                        result.push(finalEntry);
                    }
                    return result.map((data) => ({
                        time: data.time.format('YYYY-MM-DD hh:mm:ss'),
                        value: data.value,
                    }));
                };
                const newDataMap = data.map((data) => ({
                    time: data.time,
                    value: data[key],
                }));
                const finalArray = addDisconForGaps(newDataMap);
                resolve(finalArray);
            }
            catch (error) {
                http_logger_1.default.error(`[LOG] getStatusLog Error : ${(0, error_util_1.errorToJson)(error)}`);
                reject({
                    data: {
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                    },
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                });
            }
        });
    }
    async readLogLines(filePath) {
        const lines = [];
        const fileStream = fs.createReadStream(filePath, 'utf-8');
        const rl = readline.createInterface({ input: fileStream });
        for await (const line of rl) {
            if (line.trim()) {
                lines.push(line);
            }
        }
        return lines;
    }
    async parseLines(line, param) {
        const logRegex = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)](?: \[(\w+)\])? (.+)$/;
        const match = line.match(logRegex);
        if (match) {
            const [, time, level, category, text] = match;
            if (param.levels) {
                if (!param.levels.includes(level))
                    return null;
            }
            if (param.searchType == 'category') {
                if (param.searchText != '') {
                    if (!category || !category.includes(param.searchText)) {
                        return null;
                    }
                }
            }
            else if (param.searchType == 'log') {
                if (param.searchText != '') {
                    if (!text.includes(param.searchText)) {
                        return null;
                    }
                }
            }
            else if (param.searchType == 'time') {
                if (param.searchText != '') {
                    if (!time.includes(param.searchText)) {
                        return null;
                    }
                }
            }
            return {
                time,
                level,
                category: category ? category : '',
                text,
            };
        }
    }
    async getLogs(type, param) {
        try {
            const logPath = this.configService.get('dataBasePath') + `/log/${type}`;
            const logdata = [];
            const dt = new Date(param.startDt);
            const dateEnd = new Date(param.endDt);
            while (dt <= dateEnd) {
                const filePath = logPath + '/' + date_util_1.DateUtil.formatDateYYYYMMDD(dt) + '.log';
                if (fs.existsSync(filePath)) {
                    const data = fs.readFileSync(filePath, 'utf-8');
                    const lines = data.split('\n').filter((line) => line.trim() !== '');
                    const BATCH_SIZE = 100000;
                    const chunks = [];
                    for (let i = 0; i < lines.length; i += BATCH_SIZE) {
                        chunks.push(lines.slice(i, i + BATCH_SIZE));
                    }
                    for (const chunk of chunks) {
                        for (const line of chunk) {
                            const logRegex = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)](?: \[(\w+)\])? (.+)$/;
                            const match = line.match(logRegex);
                            if (match) {
                                const [, time, level, category, text] = match;
                                if (param.levels) {
                                    if (!param.levels.includes(level))
                                        continue;
                                }
                                if (param.searchType == 'category') {
                                    if (param.searchText != '') {
                                        if (!category || !category.includes(param.searchText)) {
                                            continue;
                                        }
                                    }
                                }
                                else if (param.searchType == 'log') {
                                    if (param.searchText != '') {
                                        if (!text.includes(param.searchText)) {
                                            continue;
                                        }
                                    }
                                }
                                else if (param.searchType == 'time') {
                                    if (param.searchText != '') {
                                        if (!time.includes(param.searchText)) {
                                            continue;
                                        }
                                    }
                                }
                                logdata.push({
                                    time,
                                    level,
                                    category: category ? category : '',
                                    text,
                                });
                            }
                        }
                    }
                }
                else {
                    http_logger_1.default.debug(`[LOG] getLogs File not found: ${filePath}`);
                }
                dt.setDate(dt.getDate() + 1);
            }
            if (param.sortOption == 'recent') {
                logdata.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
            }
            const count = logdata.length;
            const logs = logdata.slice(param.getOffset(), param.getLimit() + param.getOffset());
            return new pagination_response_1.PaginationResponse(count, param.getLimit(), logs);
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] getLogs Error : ${(0, error_util_1.errorToJson)(error)}`);
        }
    }
    async getSystemProcess(param) {
        try {
            const queryBuilder = this.systemRepository.createQueryBuilder();
            const dateStart = new Date(param.startDt);
            const dateEnd = new Date(param.endDt);
            dateStart.setHours(0, 0, 0, 0);
            dateEnd.setHours(23, 59, 59, 999);
            if (param.startDt) {
                queryBuilder.andWhere('time >= :startDt', {
                    startDt: dateStart,
                });
            }
            if (param.endDt) {
                queryBuilder.andWhere('time <= :endDt', {
                    endDt: dateEnd,
                });
            }
            const logs = await queryBuilder.getMany();
            const data = logs.map((log) => ({
                time: log.time,
                slamnav: log.slamnav,
                taskman: log.taskman,
                server: log.server,
                webui: log.webui,
            }));
            return data;
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] getSystemProcess Error : ${(0, error_util_1.errorToJson)(error)}`);
            return;
        }
    }
    async getSystemCpu(param) {
        try {
            const queryBuilder = this.systemRepository.createQueryBuilder();
            const dateStart = new Date(param.startDt);
            const dateEnd = new Date(param.endDt);
            dateStart.setHours(0, 0, 0, 0);
            dateEnd.setHours(23, 59, 59, 999);
            if (param.startDt) {
                queryBuilder.andWhere('time >= :startDt', {
                    startDt: dateStart,
                });
            }
            if (param.endDt) {
                queryBuilder.andWhere('time <= :endDt', {
                    endDt: dateEnd,
                });
            }
            const logs = await queryBuilder.getMany();
            const data = logs.map((log) => ({
                time: log.time,
                cpu: log.cpu,
                cpu_cores: log.cpu_cores,
                memory_free: log.memory_free,
                memory_total: log.memory_total,
            }));
            return data;
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] getSystemCpu Error : ${(0, error_util_1.errorToJson)(error)}`);
            return;
        }
    }
    async getStatus(type, param) {
        try {
            let queryBuilder;
            if (type == 'status') {
                queryBuilder = this.statusRepository.createQueryBuilder();
            }
            else if (type == 'system') {
                queryBuilder = this.systemRepository.createQueryBuilder();
            }
            const dateStart = new Date(param.startDt);
            const dateEnd = new Date(param.endDt);
            dateStart.setHours(0, 0, 0, 0);
            dateEnd.setHours(23, 59, 59, 999);
            if (param.startDt) {
                queryBuilder.andWhere('time >= :startDt', {
                    startDt: dateStart,
                });
            }
            if (param.endDt) {
                queryBuilder.andWhere('time <= :endDt', {
                    endDt: dateEnd,
                });
            }
            const logs = await queryBuilder
                .skip(param.getOffset())
                .take(param.getLimit())
                .getMany();
            const count = await queryBuilder.getCount();
            const sanitizeLogs = logs.map((log) => ({
                ...log,
                time: date_util_1.DateUtil.formatDateYYYYMMbDDsHHcMIcSSZZZ(log.time),
            }));
            return new pagination_response_1.PaginationResponse(count, param.getLimit(), sanitizeLogs);
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] getStatus Error : ${(0, error_util_1.errorToJson)(error)}`);
            return;
        }
    }
    async readState(state) {
        if (state.robot_state.charge == undefined) {
            http_logger_1.default.debug(`[LOG] readState undefined: ${JSON.stringify(state)}`);
        }
        if (state.robot_state.charge != 'none' &&
            state.robot_state.dock == 'true') {
            return 'Charging';
        }
        else {
            if (state.robot_state.power == 'false') {
                return 'Power Off';
            }
            else if (parseFloat(state.condition.mapping_ratio) > 1) {
                return 'Mapping';
            }
            else {
                if (state.map.map_name == '' ||
                    state.robot_state.localization != 'good' ||
                    state.motor[0].status != '1' ||
                    state.motor[1].status != '1') {
                    return 'Not Ready';
                }
                else if (state.move_state.obs != 'none') {
                    return 'Obstacle';
                }
                else if (state.move_state.auto_move == 'move') {
                    return 'Moving';
                }
                else if (state.move_state.auto_move == 'pause') {
                    return 'Paused';
                }
                else if (state.move_state.auto_move == 'stop') {
                    return 'Ready';
                }
                else {
                    return '?';
                }
            }
        }
    }
    async handleArchiving() {
        http_logger_1.default.info('[LOG] Starting data archiving process...');
        await this.archiveOldDataDay();
        await this.optimizeTable('status');
        http_logger_1.default.info('[LOG] Data archiving and optimization completed.');
    }
    async emitStatusTest(time) {
        return new Promise(async (resolve, reject) => {
            try {
                const state = {
                    pose: {
                        x: '0',
                        y: '0',
                        rz: '0',
                    },
                    map: {
                        map_name: '',
                    },
                    vel: {
                        vx: '0',
                        vy: '0',
                        wz: '0',
                    },
                    imu: {
                        acc_x: '0',
                        acc_y: '0',
                        acc_z: '0',
                        gyr_x: '0',
                        gyr_y: '0',
                        gyr_z: '0',
                        imu_rx: '0',
                        imu_ry: '0',
                        imu_rz: '0',
                    },
                    goal_node: {
                        id: '',
                        name: '',
                        state: '',
                        x: '0',
                        y: '0',
                        rz: '0',
                    },
                    cur_node: {
                        id: '',
                        name: '',
                        state: '',
                        x: '0',
                        y: '0',
                        rz: '0',
                    },
                    motor: [
                        {
                            connection: 'false',
                            status: '0',
                            temp: '0',
                            current: '0',
                        },
                        {
                            connection: 'false',
                            status: '0',
                            temp: '0',
                            current: '0',
                        },
                    ],
                    lidar: [
                        {
                            connection: 'false',
                            port: '',
                            serialnumber: '',
                        },
                        {
                            connection: 'false',
                            serialnumber: '',
                            port: '',
                        },
                    ],
                    power: {
                        bat_in: '0',
                        bat_out: '0',
                        bat_current: '0',
                        power: '0',
                        total_power: '0',
                        charge_current: '0',
                        contact_voltage: '0',
                    },
                    move_state: {
                        auto_move: 'stop',
                        dock_move: 'stop',
                        jog_move: 'stop',
                        obs: 'none',
                        path: 'none',
                    },
                    robot_state: {
                        power: 'false',
                        dock: 'false',
                        emo: 'false',
                        charge: 'false',
                        localization: 'none',
                    },
                    condition: {
                        inlier_error: '0',
                        inlier_ratio: '0',
                        mapping_error: '0',
                        mapping_ratio: '0',
                    },
                    setting: {
                        platform_type: '',
                    },
                    time: '',
                };
                http_logger_1.default.debug(`[LOG] emitStatusTest: ${new Date(time)}, ${time}`);
                const newLog = {
                    time: new Date(time),
                    slam: false,
                    type: state.setting.platform_type,
                    conditions: {
                        inlier_ratio: parseFloat(state.condition.inlier_ratio),
                        inlier_error: parseFloat(state.condition.inlier_error),
                    },
                    move_state: {
                        state: await this.readState(state),
                        auto_move: state.move_state.auto_move,
                        dock_move: state.move_state.dock_move,
                        jog_move: state.move_state.jog_move,
                        obs: state.move_state.obs,
                        path: state.move_state.path,
                    },
                    robot_state: {
                        charge: state.robot_state.charge,
                        dock: state.robot_state.dock,
                        localization: state.robot_state.localization,
                        power: state.robot_state.power == 'true' ? true : false,
                    },
                    task: {
                        connection: false,
                        file: '',
                        id: 0,
                        running: false,
                    },
                    map: state.map.map_name,
                    imu: {
                        acc_x: parseFloat(state.imu.acc_x),
                        acc_y: parseFloat(state.imu.acc_y),
                        acc_z: parseFloat(state.imu.acc_z),
                        gyr_x: parseFloat(state.imu.gyr_y),
                        gyr_y: parseFloat(state.imu.gyr_y),
                        gyr_z: parseFloat(state.imu.gyr_y),
                        imu_rx: parseFloat(state.imu.imu_rx),
                        imu_ry: parseFloat(state.imu.imu_ry),
                        imu_rz: parseFloat(state.imu.imu_rz),
                    },
                    motor0: {
                        connection: state.motor[0].connection == 'true' ? true : false,
                        status: parseInt(state.motor[0].status),
                        current: parseFloat(state.motor[0].current),
                        temp: parseFloat(state.motor[0].temp),
                    },
                    motor1: {
                        connection: state.motor[1].connection == 'true' ? true : false,
                        status: parseInt(state.motor[1].status),
                        current: parseFloat(state.motor[1].current),
                        temp: parseFloat(state.motor[1].temp),
                    },
                    power: {
                        bat_current: parseFloat(state.power.bat_current),
                        bat_in: parseFloat(state.power.bat_in),
                        bat_out: parseFloat(state.power.bat_out),
                        power: parseFloat(state.power.power),
                        total_power: parseFloat(state.power.total_power),
                        charge_current: parseFloat(state.power.charge_current),
                        contact_voltage: parseFloat(state.power.contact_voltage),
                    },
                    pose: {
                        x: parseFloat(state.pose.x),
                        y: parseFloat(state.pose.y),
                        rz: parseFloat(state.pose.rz),
                        vx: parseFloat(state.vel.vx),
                        vy: parseFloat(state.vel.vy),
                        wz: parseFloat(state.vel.wz),
                    },
                };
                await this.statusRepository.save(newLog);
                resolve(newLog);
            }
            catch (error) {
                http_logger_1.default.error(`[LOG] emitStatus: ${(0, error_util_1.errorToJson)(error)}`);
                reject({
                    data: {
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                    },
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                });
            }
        });
    }
    async emitStatus(state, slam, task) {
        return new Promise(async (resolve, reject) => {
            try {
                const newLog = {
                    time: new Date(),
                    slam: slam,
                    type: state.setting.platform_type,
                    conditions: {
                        inlier_ratio: parseFloat(state.condition.inlier_ratio),
                        inlier_error: parseFloat(state.condition.inlier_error),
                    },
                    move_state: {
                        state: await this.readState(state),
                        auto_move: state.move_state.auto_move,
                        dock_move: state.move_state.dock_move,
                        jog_move: state.move_state.jog_move,
                        obs: state.move_state.obs,
                        path: state.move_state.path,
                    },
                    robot_state: {
                        charge: state.robot_state.charge,
                        dock: state.robot_state.dock,
                        localization: state.robot_state.localization,
                        power: state.robot_state.power == 'true' ? true : false,
                    },
                    map: state.map.map_name,
                    task: {
                        connection: task.connection,
                        file: task.file,
                        id: task.id,
                        running: task.running,
                    },
                    imu: {
                        acc_x: parseFloat(state.imu.acc_x),
                        acc_y: parseFloat(state.imu.acc_y),
                        acc_z: parseFloat(state.imu.acc_z),
                        gyr_x: parseFloat(state.imu.gyr_y),
                        gyr_y: parseFloat(state.imu.gyr_y),
                        gyr_z: parseFloat(state.imu.gyr_y),
                        imu_rx: parseFloat(state.imu.imu_rx),
                        imu_ry: parseFloat(state.imu.imu_ry),
                        imu_rz: parseFloat(state.imu.imu_rz),
                    },
                    motor0: {
                        connection: state.motor[0].connection == 'true' ? true : false,
                        status: parseInt(state.motor[0].status),
                        current: parseFloat(state.motor[0].current),
                        temp: parseFloat(state.motor[0].temp),
                    },
                    motor1: {
                        connection: state.motor[1].connection == 'true' ? true : false,
                        status: parseInt(state.motor[1].status),
                        current: parseFloat(state.motor[1].current),
                        temp: parseFloat(state.motor[1].temp),
                    },
                    power: {
                        bat_current: parseFloat(state.power.bat_current),
                        bat_in: parseFloat(state.power.bat_in),
                        bat_out: parseFloat(state.power.bat_out),
                        power: parseFloat(state.power.power),
                        total_power: parseFloat(state.power.total_power),
                        charge_current: parseFloat(state.power.charge_current),
                        contact_voltage: parseFloat(state.power.contact_voltage),
                    },
                    pose: {
                        x: parseFloat(state.pose.x),
                        y: parseFloat(state.pose.y),
                        rz: parseFloat(state.pose.rz),
                        vx: parseFloat(state.vel.vx),
                        vy: parseFloat(state.vel.vy),
                        wz: parseFloat(state.vel.wz),
                    },
                };
                await this.statusRepository.save(newLog);
                resolve(newLog);
            }
            catch (error) {
                http_logger_1.default.error(`[LOG] emitStatus: ${(0, error_util_1.errorToJson)(error)}`);
                reject({
                    data: {
                        message: http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500,
                    },
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                });
            }
        });
    }
    async checkTables(name, query) {
        http_logger_1.default.debug(`checkTables: ${name}`);
        try {
            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            const [rows] = await queryRunner.query(`
            SELECT COUNT(*)
            FROM information_schema.tables
            WHERE table_schema = DATABASE() AND table_name = '${name}'
          `);
            const tableExists = rows['COUNT(*)'] > 0;
            if (!tableExists) {
                http_logger_1.default.info(`[LOG] checkTable: Table "${name}" does not exist. Creating...`);
                await queryRunner.query(query);
                http_logger_1.default.info(`[LOG] checkTable: Table "${name}" created successfully.`);
            }
            else {
                http_logger_1.default.info(`[LOG] checkTable: Table "${name}" exist.`);
            }
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] checkTable: ${(0, error_util_1.errorToJson)(error)}`);
        }
    }
    async archiveOldDataDay() {
        const startDt = await this.getOldestTime();
        http_logger_1.default.debug(`[LOG] archiveOldDataDay: startDt(${startDt})`);
        const dt = startDt;
        const endDt = new Date();
        endDt.setDate(endDt.getDate() - 60);
        endDt.setHours(0, 0, 0, 0);
        while (dt < endDt) {
            await this.archiveOldDBData('status', date_util_1.DateUtil.formatDateYYYYMMDD(dt));
            await this.archiveOldDBData('system', date_util_1.DateUtil.formatDateYYYYMMDD(dt));
            await this.archiveOldJSONData('socket', date_util_1.DateUtil.formatDateYYYYMMDD(dt));
            await this.archiveOldJSONData('http', date_util_1.DateUtil.formatDateYYYYMMDD(dt));
            dt.setDate(dt.getDate() + 1);
            http_logger_1.default.debug(`[LOG] archiveOldDataDay: nextDt(${dt}), endDt(${endDt})`);
        }
        http_logger_1.default.debug(`[LOG] archiveOldDataDay: Done`);
        return;
    }
    async getOldestTime() {
        const oldestRecord = await this.statusRepository
            .createQueryBuilder('entity')
            .select('entity.time')
            .orderBy('entity.time', 'ASC')
            .getOne();
        return oldestRecord?.time || null;
    }
    async archiveOldDBData(type, date) {
        const dateStart = new Date(date);
        const dateEnd = new Date(date);
        dateStart.setHours(0, 0, 0, 0);
        dateEnd.setHours(23, 59, 59, 999);
        let oldData;
        if (type == 'status') {
            oldData = await this.statusRepository
                .createQueryBuilder()
                .where('time >= :dateStart && time <= :dateEnd', { dateStart, dateEnd })
                .getMany();
        }
        else if (type == 'system') {
            oldData = await this.systemRepository
                .createQueryBuilder()
                .where('time >= :dateStart && time <= :dateEnd', { dateStart, dateEnd })
                .getMany();
        }
        const oldData_time = oldData.map((data) => ({
            ...data,
            time: date_util_1.DateUtil.formatDateYYYYMMbDDsHHcMIcSSZZZ(data.time),
        }));
        if (oldData.length > 0) {
            const dataBasePath = this.configService.get('dataBasePath');
            const archiveDir = path.join(dataBasePath, 'log', 'archive', type);
            if (!fs.existsSync(archiveDir)) {
                fs.mkdirSync(archiveDir, { recursive: true });
            }
            const fileName = `${moment(date).format('YYYY-MM-DD')}`;
            const filePath = path.join(archiveDir, fileName);
            let jsonData = [];
            if (fs.existsSync(filePath)) {
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                jsonData = JSON.parse(fileContent);
                if (!Array.isArray(jsonData)) {
                    jsonData = [];
                }
            }
            jsonData.push(oldData_time);
            fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
            const zip = new AdmZip();
            zip.addLocalFile(filePath);
            zip.writeZip(filePath + '.archive');
            fs.unlink(filePath, (err) => {
                if (err) {
                    http_logger_1.default.error(`[LOG] ArchiveOldDBData File Unlink : ${filePath}, ${(0, error_util_1.errorToJson)(err)}`);
                }
            });
            if (type == 'status') {
                await this.statusRepository
                    .createQueryBuilder()
                    .delete()
                    .where('time >= :dateStart && time <= :dateEnd', {
                    dateStart,
                    dateEnd,
                })
                    .execute();
            }
            else if (type == 'system') {
                await this.systemRepository
                    .createQueryBuilder()
                    .delete()
                    .where('time >= :dateStart && time <= :dateEnd', {
                    dateStart,
                    dateEnd,
                })
                    .execute();
            }
            http_logger_1.default.info(`[LOG] ArchiveOldDBData: Archived data saved to ${filePath}`);
        }
        else {
            http_logger_1.default.info(`[LOG] ArchiveOldDBData: No data to archive`);
        }
    }
    async archiveOldJSONData(type, date) {
        const dataBasePath = this.configService.get('dataBasePath');
        const filePath = path.join(dataBasePath, 'log', type, date + '.log');
        if (fs.existsSync(filePath)) {
            const zipPath = path.join('data', 'log', 'archive', type, date + '.archive');
            const zip = new AdmZip();
            zip.addLocalFile(filePath);
            zip.writeZip(zipPath);
            fs.unlink(filePath, (err) => {
                if (err) {
                    http_logger_1.default.error(`[LOG] archiveOldJSONData: Archive unlink Error : ${(0, error_util_1.errorToJson)(err)}`);
                }
            });
            http_logger_1.default.info(`[LOG] archiveOldJSONData: Archived Done ${filePath} -> ${zipPath}`);
        }
        else {
            http_logger_1.default.debug(`[LOG] archiveOldJSONData: ${date} Log file not found`);
        }
    }
    async optimizeTable(tableName) {
        try {
            await this.dataSource.query(`OPTIMIZE TABLE ${tableName}`);
            http_logger_1.default.info(`[LOG] optimizeTable: Table ${tableName} optimized successfully`);
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] optimizeTable: optimizing table ${tableName}, ${(0, error_util_1.errorToJson)(error)}`);
            throw error;
        }
    }
    async getCpuUsage() {
        try {
            const cpuLoad = await si.currentLoad();
            const sysUsage = {
                cpu: cpuLoad.currentLoad,
                total_memory: os.totalmem() / 1024 ** 3,
                free_memory: os.freemem() / 1024 ** 3,
                cpu_cores: [],
            };
            cpuLoad.cpus.map((cpu) => {
                sysUsage.cpu_cores.push(cpu.load);
            });
            return sysUsage;
        }
        catch (error) {
            console.error(`[LOG] getCpuUsage: ${JSON.stringify(error)}`);
        }
    }
    async getProcessUsage() {
        try {
            const processUsages = new Map();
            const data = (0, child_process_1.execSync)('ps aux --sort=-%cpu')
                .toString()
                .split('\n')
                .slice(1);
            const processes = data.map((line) => {
                const columns = line.trim().split(/\s+/);
                return {
                    user: columns[0],
                    pid: columns[1],
                    cpu: parseFloat(columns[2]),
                    mem: parseFloat(columns[3]),
                    vsz: parseInt(columns[4]) / 1024 / 1024,
                    rss: parseInt(columns[5]) / 1024 / 1024,
                    time: columns[8],
                    command: columns.slice(10).join(' '),
                };
            });
            let serverInfo = { cpu: 0, mem: 0, vsz: 0, rss: 0 };
            let uiInfo = { cpu: 0, mem: 0, vsz: 0, rss: 0 };
            let slamnavInfo = { cpu: 0, mem: 0, vsz: 0, rss: 0 };
            let taskmanInfo = { cpu: 0, mem: 0, vsz: 0, rss: 0 };
            try {
                processes.map((process) => {
                    if (process.command.includes('web_robot_server') ||
                        process.command.includes('nest')) {
                        serverInfo = {
                            cpu: serverInfo.cpu + process.cpu / 8,
                            mem: serverInfo.mem + process.mem,
                            vsz: serverInfo.vsz + process.vsz,
                            rss: serverInfo.rss + process.rss,
                        };
                    }
                    else if (process.command.includes('web_robot_ui') ||
                        process.command.includes('next')) {
                        uiInfo = {
                            cpu: uiInfo.cpu + process.cpu / 8,
                            mem: uiInfo.mem + process.mem,
                            vsz: uiInfo.vsz + process.vsz,
                            rss: uiInfo.rss + process.rss,
                        };
                    }
                    else if (process.command.includes('TaskMan')) {
                        taskmanInfo = {
                            cpu: taskmanInfo.cpu + process.cpu / 8,
                            mem: taskmanInfo.mem + process.mem,
                            vsz: taskmanInfo.vsz + process.vsz,
                            rss: taskmanInfo.rss + process.rss,
                        };
                    }
                    else if (process.command.includes('SLAMNAV2')) {
                        slamnavInfo = {
                            cpu: slamnavInfo.cpu + process.cpu / 8,
                            mem: slamnavInfo.mem + process.mem,
                            vsz: slamnavInfo.vsz + process.vsz,
                            rss: slamnavInfo.rss + process.rss,
                        };
                    }
                    else if (process.command.includes('mediamtx')) {
                    }
                });
                processUsages.set('web_robot_server', serverInfo);
                processUsages.set('web_robot_ui', uiInfo);
                processUsages.set('SLAMNAV2', slamnavInfo);
                processUsages.set('TaskMan', taskmanInfo);
            }
            catch (error) {
                console.error(error);
            }
            return processUsages;
        }
        catch (error) {
            console.error(`[LOG] getProcessUsage: ${JSON.stringify(error)}`);
        }
    }
    async getNetworkUsage() {
        try {
            const networkUsages = new Map();
            const data = fs.readFileSync('/proc/net/dev', 'utf8');
            const lines = data.split('\n');
            const interfaces = {};
            lines.forEach((line) => {
                if (line.includes(':')) {
                    const parts = line.split(':');
                    const interfaceName = parts[0].trim();
                    const stats = parts[1].trim().split(/\s+/);
                    const rxPackets = parseInt(stats[1]);
                    const txPackets = parseInt(stats[9]);
                    const rxDrops = parseInt(stats[3]);
                    const txDrops = parseInt(stats[11]);
                    const rxErrors = parseInt(stats[2]);
                    const txErrors = parseInt(stats[10]);
                    const rxKBytes = (parseInt(stats[0], 10) * 8) / 1000;
                    const txKBytes = (parseInt(stats[8], 10) * 8) / 1000;
                    interfaces[interfaceName] = {
                        rxKBytes,
                        txKBytes,
                        rxPackets,
                        txPackets,
                        rxDrops,
                        txDrops,
                        rxErrors,
                        txErrors,
                    };
                }
            });
            for (const interfaceName in interfaces) {
                if (this.previousStats[interfaceName]) {
                    const rxDiff = interfaces[interfaceName].rxKBytes -
                        this.previousStats[interfaceName].rxKBytes;
                    const txDiff = interfaces[interfaceName].txKBytes -
                        this.previousStats[interfaceName].txKBytes;
                    const timeDiff = (new Date().getTime() - this.previousTime.getTime()) / 1000;
                    const rxKbps = rxDiff / timeDiff;
                    const txKbps = txDiff / timeDiff;
                    interfaces[interfaceName] = {
                        ...interfaces[interfaceName],
                        rxKbps,
                        txKbps,
                    };
                }
                else {
                    interfaces[interfaceName] = {
                        ...interfaces[interfaceName],
                        rxKbps: 0,
                        txKbps: 0,
                    };
                }
                networkUsages.set(interfaceName, interfaces[interfaceName]);
            }
            this.previousStats = interfaces;
            this.previousTime = new Date();
            return networkUsages;
        }
        catch (error) {
            console.error(error);
        }
    }
    async emitSystem() {
        try {
            const newLog = {
                time: new Date(),
                cpu: this.systemUsage.cpu,
                cpu_cores: this.systemUsage.cpu_cores,
                memory_free: this.systemUsage.free_memory,
                memory_total: this.systemUsage.total_memory,
                network: this.networkUsage,
                slamnav: this.processUsage.get('SLAMNAV2'),
                server: this.processUsage.get('web_robot_server'),
                webui: this.processUsage.get('web_robot_ui'),
                taskman: this.processUsage.get('TaskMan'),
            };
            await this.systemRepository.save(newLog);
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] emitSystem: ${(0, error_util_1.errorToJson)(error)}`);
        }
    }
    async getSystemCurrent() {
        return {
            system: this.systemUsage,
            process: this.processUsage,
            network: this.networkUsage,
        };
    }
    async readMemoryUsage() {
        try {
            if (process.platform.includes('linux')) {
                this.systemUsage = await this.getCpuUsage();
                this.processUsage = await this.getProcessUsage();
            }
        }
        catch (error) {
            http_logger_1.default.error(`[LOG] readMemoryUsage: ${JSON.stringify(error)}`);
        }
    }
};
exports.LogService = LogService;
__decorate([
    (0, schedule_1.Cron)('0 0 */12 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LogService.prototype, "handleArchiving", null);
exports.LogService = LogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(status_entity_1.StatusLogEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(system_entity_1.SystemLogEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_3.DataSource,
        config_1.ConfigService])
], LogService);
//# sourceMappingURL=log.service.js.map