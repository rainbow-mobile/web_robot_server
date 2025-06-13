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
exports.SocketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const socket_io_client_1 = require("socket.io-client");
const socket_logger_1 = require("../../../common/logger/socket.logger");
const network_util_1 = require("../../../common/util/network.util");
const common_1 = require("@nestjs/common");
const error_util_1 = require("../../../common/util/error.util");
const network_service_1 = require("../../apis/network/network.service");
const admin_ui_1 = require("@socket.io/admin-ui");
const net = require("net");
const motion_dto_1 = require("../../apis/motion/dto/motion.dto");
const subscribe_dto_1 = require("../dto/subscribe.dto");
const equipment_logger_1 = require("../../../common/logger/equipment.logger");
const equipment_enum_1 = require("../../../common/enum/equipment.enum");
const log_service_1 = require("../../apis/log/log.service");
const microservices_1 = require("@nestjs/microservices");
const alarm_dto_1 = require("../dto/alarm.dto");
const isEqual = (a, b) => {
    return JSON.stringify(a) === JSON.stringify(b);
};
let SocketGateway = class SocketGateway {
    constructor(networkService, logService) {
        this.networkService = networkService;
        this.logService = logService;
        this.tcpServer = null;
        this.tcpClient = null;
        this.taskState = {
            connection: false,
            file: '',
            id: 0,
            running: false,
            variables: [],
            result: undefined,
        };
        this.moveState = {
            command: '',
            id: undefined,
            x: undefined,
            y: undefined,
            z: undefined,
            rz: undefined,
            preset: undefined,
            method: undefined,
            result: undefined,
        };
        this.motionState = {
            command: motion_dto_1.MotionCommand.MOTION_GATE,
            method: motion_dto_1.MotionMethod.SITTING,
        };
        this.robotState = {
            pose: {
                x: '0',
                y: '0',
                rz: '0',
            },
            map: {
                map_name: '',
                map_status: '',
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
                bat_percent: '0',
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
        this.frsSocket = null;
        this.lidarCloud = [];
        this.debugMode = false;
        this.intervalTime = 500 + Math.floor(Math.random() * 500);
        this.interval_frs = setInterval(() => {
            const statusData = {
                robotSerial: global.robotSerial,
                data: {
                    slam: { connection: this.slamnav ? true : false },
                    task: this.taskState,
                    frs: this.frsSocket?.connected,
                    time: Date.now().toString(),
                },
            };
            this.server.to(['programStatus', 'all', 'allStatus']).emit('programStatus', statusData.data);
            if (this.frsSocket?.connected && global.robotSerial != '') {
                this.frsSocket.emit('programStatus', statusData);
            }
        }, this.intervalTime);
    }
    afterInit() {
        (0, admin_ui_1.instrument)(this.server, {
            auth: false,
            mode: 'development',
        });
    }
    TCP_Open() {
        this.tcpServer = net.createServer((socket) => {
            this.tcpClient = socket;
            socket_logger_1.default.info(`[NETWORK] TCP Client Connected : ${socket.remoteAddress}`);
            this.tcpClient.on('data', (data) => {
                socket_logger_1.default.info(`[NETWORK] TCP Data in : ${data.toString()}`);
                try {
                    const command = data.toString().split(' ')[0];
                    const param = data.toString().split(' ')[1];
                    console.log(data, command, param);
                    if (command == 'req_status') {
                        let data;
                        if (param == 'slamnav') {
                            data = this.slamnav ? 'connected' : 'disconnected';
                            this.tcpClient.write(data);
                        }
                        else if (param == 'pose') {
                            data =
                                '{' +
                                    this.robotState.pose.x +
                                    ',' +
                                    this.robotState.pose.y +
                                    ',' +
                                    this.robotState.pose.rz +
                                    '}';
                            this.tcpClient.write(data);
                        }
                        else if (param == 'map') {
                            data =
                                this.robotState.map.map_name == ''
                                    ? 'not loaded'
                                    : this.robotState.map.map_name;
                            this.tcpClient.write(data);
                        }
                        else if (param == 'localization') {
                            data = this.robotState.robot_state.localization;
                            this.tcpClient.write(data);
                        }
                        else if (param == 'charge') {
                            data = this.robotState.robot_state.charge;
                            this.tcpClient.write(data);
                        }
                        else if (param == 'dock') {
                            data = this.robotState.robot_state.dock;
                            this.tcpClient.write(data);
                        }
                        else if (param == 'auto_move') {
                            data = this.robotState.move_state.auto_move;
                            this.tcpClient.write(data);
                        }
                        else if (param == 'path') {
                            data = this.robotState.move_state.path;
                            this.tcpClient.write(data);
                        }
                        else if (param == 'obs') {
                            data = this.robotState.move_state.obs;
                            this.tcpClient.write(data);
                        }
                        else if (param == 'cur_node_id') {
                            data =
                                this.robotState.cur_node.id == ''
                                    ? '-'
                                    : this.robotState.cur_node.id;
                            this.tcpClient.write(data);
                        }
                        else if (param == 'cur_node_pose') {
                            data =
                                '{' +
                                    this.robotState.cur_node.x +
                                    ',' +
                                    this.robotState.cur_node.y +
                                    ',' +
                                    this.robotState.cur_node.rz +
                                    '}';
                            this.tcpClient.write(data);
                        }
                        else if (param == 'goal_node_id') {
                            data =
                                this.robotState.goal_node.id == ''
                                    ? '-'
                                    : this.robotState.goal_node.id;
                            this.tcpClient.write(data);
                        }
                        else if (param == 'goal_node_state') {
                            data =
                                this.robotState.goal_node.state == ''
                                    ? 'none'
                                    : this.robotState.goal_node.state;
                            this.tcpClient.write(data);
                        }
                        else if (param == 'goal_node_pose') {
                            data =
                                '{' +
                                    this.robotState.goal_node.x +
                                    ',' +
                                    this.robotState.goal_node.y +
                                    ',' +
                                    this.robotState.goal_node.rz +
                                    '}';
                            this.tcpClient.write(data);
                        }
                        else if (param == 'battery') {
                            data =
                                '{' +
                                    this.robotState.power.bat_in +
                                    ',' +
                                    this.robotState.power.bat_out +
                                    ',' +
                                    this.robotState.power.bat_current +
                                    '}';
                            this.tcpClient.write(data);
                        }
                        console.debug(param + ' send : ', data);
                    }
                    else if (this.slamnav) {
                        if (command == 'move') {
                            let sendData;
                            if (param == 'stop') {
                                sendData = { command: param, time: Date.now().toString() };
                            }
                            else if (param == 'pause') {
                                sendData = { command: param, time: Date.now().toString() };
                            }
                            else if (param == 'resume') {
                                sendData = { command: param, time: Date.now().toString() };
                            }
                            else {
                                sendData = {
                                    command: 'goal',
                                    goal_id: param,
                                    method: 'pp',
                                    preset: '0',
                                    time: Date.now().toString(),
                                };
                            }
                            console.log('tcpClient command move : ', JSON.stringify(sendData));
                            this.slamnav?.emit('move', sendData);
                        }
                        else if (command == 'dock') {
                            const sendData = {
                                command: param,
                            };
                            console.log('tcpClient command dock : ', JSON.stringify(sendData));
                            this.slamnav?.emit('dock', sendData);
                        }
                        else if (command == 'mapload') {
                            const sendData = {
                                command: command,
                                name: param,
                            };
                            console.log('tcpClient command load : ', JSON.stringify(sendData));
                            this.slamnav?.emit('load', sendData);
                        }
                        else if (command == 'localization') {
                            let sendData;
                            if (param == 'semiautoinit') {
                                sendData = {
                                    command: param,
                                };
                            }
                            else if (param == 'autoinit') {
                                sendData = {
                                    command: param,
                                };
                            }
                            else if (param == 'start') {
                                sendData = {
                                    command: param,
                                };
                            }
                            else if (param == 'stop') {
                                sendData = {
                                    command: param,
                                };
                            }
                            else if (param.split(',').length > 2) {
                                sendData = {
                                    command: 'init',
                                    x: param.split(',')[0],
                                    y: param.split(',')[1],
                                    rz: param.split(',')[2],
                                };
                            }
                            else {
                                this.tcpClient.write('unknowncommand');
                                return;
                            }
                            console.log('tcpClient command localization : ', JSON.stringify(sendData));
                            this.slamnav?.emit('localization', sendData);
                        }
                        else {
                            this.tcpClient.write('unknowncommand');
                        }
                    }
                    else {
                        this.tcpClient.write('disconnected');
                    }
                }
                catch (error) {
                    socket_logger_1.default.error(`[NETWORK] TCP Data Parse : ${(0, error_util_1.errorToJson)(error)}`);
                    this.tcpClient.write('error');
                }
            });
            this.tcpClient.on('end', () => {
                socket_logger_1.default.info(`[NETWORK] TCP Client Disconnected`);
            });
            this.tcpClient.on('error', (err) => {
                socket_logger_1.default.error(`[NETWORK TCP Server Error : ${(0, error_util_1.errorToJson)(err)}]`);
            });
        });
        this.tcpServer.listen('11338', '0.0.0.0', () => {
            socket_logger_1.default.info(`[NETWORK] TCP Server listen : 11338`);
        });
        this.tcpServer.on('error', (err) => {
            socket_logger_1.default.error(`[NETWORK] TCP Server error : ${(0, error_util_1.errorToJson)(err)}`);
        });
    }
    setDebugMode(onoff) {
        socket_logger_1.default.info(`[COMMAND] setDebugMode : ${onoff}`);
        this.debugMode = false;
    }
    async connectFrsSocket(url) {
        try {
            if (global.robotSerial == undefined || global.robotSerial == '') {
                socket_logger_1.default.warn(`[CONNECT] FRS Socket pass : robotSerial missing`);
                return;
            }
            if (this.frsSocket?.connected) {
                this.frsSocket.disconnect();
                socket_logger_1.default.info(`[CONNECT] FRS Socket disconnect`);
                this.frsSocket.close();
                global.frsConnect = false;
                this.frsSocket = null;
            }
            this.frsSocket = (0, socket_io_client_1.io)(url, { transports: ['websocket'] });
            this.frsSocket.off();
            socket_logger_1.default.debug(`[CONNECT] FRS Socket URL: ${url}, ${global.robotSerial}`);
            this.frsSocket.on('connect', () => {
                socket_logger_1.default.info(`[CONNECT] FRS Socket connected`);
                global.frsConnect = true;
                const sendData = {
                    robotSerial: global.robotSerial,
                };
                const newData = { command: 'resume', time: Date.now().toString() };
                socket_logger_1.default.info(`[TEST] Frs connected and Move Resume`);
                this.slamnav?.emit('move', (0, network_util_1.stringifyAllValues)(newData));
                socket_logger_1.default.debug(`[CONNECT] FRS init : ${JSON.stringify(sendData)}`);
                this.frsSocket.emit('init', sendData);
            });
            this.frsSocket.on('disconnect', (data) => {
                socket_logger_1.default.error(`[CONNECT] FRS Socket disconnected: ${(0, error_util_1.errorToJson)(data)}`);
                global.frsConnect = false;
                this.lastGoal = this.lastMoveStatus.goal_node.id;
                const newData = { command: 'pause', time: Date.now().toString() };
                socket_logger_1.default.info(`[TEST] Frs disconnected and Move Pause`);
                this.slamnav?.emit('move', (0, network_util_1.stringifyAllValues)(newData));
            });
            this.frsSocket.on('error', (error) => {
                socket_logger_1.default.error(`[CONNECT] FRS Socket error: ${(0, error_util_1.errorToJson)(error)}`);
            });
            this.frsSocket.on('init', (_data) => {
                try {
                    if (_data == null || _data == undefined) {
                        socket_logger_1.default.warn(`[INIT] Frs Init : NULL`);
                        return;
                    }
                    const data = _data;
                    const json = JSON.parse(data);
                    if (json.robotSerial == global.robotSerial) {
                        socket_logger_1.default.info(`[INIT] Get Robot Info from FRS: SerialNumber(${json.robotSerial}), ip(${json.robotIpAdrs}), name(${json.robotNm})`);
                        global.robotNm = json.robotNm;
                    }
                    const newData = {
                        command: 'resume',
                        time: Date.now().toString(),
                    };
                    this.slamnav?.emit('move', (0, network_util_1.stringifyAllValues)(newData));
                    socket_logger_1.default.info(`[TEST] Frs connected and Resume`);
                }
                catch (error) {
                    socket_logger_1.default.error(`[INIT] FrsSocket init Error : ${JSON.stringify(_data)}, ${(0, error_util_1.errorToJson)(error)}`);
                }
            });
            this.frsSocket.on('move', (_data) => {
                try {
                    if (_data == null || _data == undefined) {
                        socket_logger_1.default.warn(`[COMMAND] FRS Move : NULL`);
                        return;
                    }
                    else {
                        const data = _data;
                        const json = JSON.parse(data);
                        if (json.command == null ||
                            json.command == undefined ||
                            json.command == '') {
                            socket_logger_1.default.warn(`[COMMAND] FRS Move : Command NULL`);
                            return;
                        }
                        socket_logger_1.default.info(`[COMMAND] FRS Move: ${JSON.stringify(json)}`);
                        if (this.slamnav) {
                            this.slamnav?.emit('move', (0, network_util_1.stringifyAllValues)(json));
                        }
                        else {
                            this.frsSocket.emit('moveResponse', {
                                robotSerial: global.robotSerial,
                                data: {
                                    ...data,
                                    result: 'fail',
                                    message: 'SLAMNAV2 disconnected',
                                },
                            });
                        }
                    }
                }
                catch (error) {
                    socket_logger_1.default.error(`[COMMAND] FRS Move: ${JSON.stringify(_data)}, ${(0, error_util_1.errorToJson)(error)}`);
                }
            });
            this.frsSocket.on('load', (_data) => {
                try {
                    if (_data == null || _data == undefined) {
                        socket_logger_1.default.warn(`[COMMAND] FRS load : NULL`);
                        return;
                    }
                    const data = _data;
                    const json = JSON.parse(data);
                    if (json.command == null ||
                        json.command == undefined ||
                        json.command == '') {
                        socket_logger_1.default.warn(`[COMMAND] FRS load : Command NULL`);
                        return;
                    }
                    socket_logger_1.default.debug(`[COMMAND] FRS Load: ${JSON.stringify(json)}`);
                    if (this.slamnav) {
                        this.slamnav.emit('load', (0, network_util_1.stringifyAllValues)(json));
                    }
                    else {
                        this.frsSocket.emit('loadResponse', {
                            robotSerial: global.robotSerial,
                            data: {
                                ...data,
                                result: 'fail',
                                message: 'SLAMNAV2 disconnected',
                            },
                        });
                    }
                }
                catch (error) {
                    socket_logger_1.default.error(`[COMMAND] FRS MapLoad: ${JSON.stringify(_data)}, ${(0, error_util_1.errorToJson)(error)}`);
                }
            });
            this.frsSocket.on('motor', (_data) => {
                try {
                    if (_data == null || _data == undefined) {
                        socket_logger_1.default.warn(`[COMMAND] FRS motor : NULL`);
                        return;
                    }
                    const data = _data;
                    const json = JSON.parse(data);
                    if (json.command == null ||
                        json.command == undefined ||
                        json.command == '') {
                        socket_logger_1.default.warn(`[COMMAND] FRS motor : Command NULL`);
                        return;
                    }
                    socket_logger_1.default.debug(`[COMMAND] FRS motor: ${JSON.stringify(json)}`);
                    if (this.slamnav) {
                        this.slamnav.emit('motor', (0, network_util_1.stringifyAllValues)(json));
                    }
                    else {
                        this.frsSocket.emit('motorResponse', {
                            robotSerial: global.robotSerial,
                            data: {
                                ...data,
                                result: 'fail',
                                message: 'SLAMNAV2 disconnected',
                            },
                        });
                    }
                }
                catch (error) {
                    socket_logger_1.default.error(`[COMMAND] FRS motor: ${JSON.stringify(_data)}, ${(0, error_util_1.errorToJson)(error)}`);
                }
            });
            this.frsSocket.on('localization', (_data) => {
                try {
                    if (_data == null || _data == undefined) {
                        socket_logger_1.default.warn(`[COMMAND] FRS localization : NULL`);
                        return;
                    }
                    const data = _data;
                    const json = JSON.parse(data);
                    if (json.command == null ||
                        json.command == undefined ||
                        json.command == '') {
                        socket_logger_1.default.warn(`[COMMAND] FRS localization : Command NULL`);
                        return;
                    }
                    socket_logger_1.default.debug(`[COMMAND] FRS Localization: ${JSON.stringify(json)}`);
                    if (this.slamnav) {
                        this.slamnav.emit('localization', (0, network_util_1.stringifyAllValues)(json));
                    }
                    else {
                        this.frsSocket.emit('localizationResponse', {
                            robotSerial: global.robotSerial,
                            data: {
                                ...data,
                                result: 'fail',
                                message: 'SLAMNAV2 disconnected',
                            },
                        });
                    }
                }
                catch (error) {
                    socket_logger_1.default.error(`[COMMAND] FRS Localization: ${JSON.stringify(_data)}, ${(0, error_util_1.errorToJson)(error)}`);
                }
            });
            this.frsSocket.on('randomseq', (_data) => {
                try {
                    if (_data == null || _data == undefined) {
                        socket_logger_1.default.warn(`[COMMAND] FRS randomseq : NULL`);
                        return;
                    }
                    const data = _data;
                    const json = JSON.parse(data);
                    if (json.command == null ||
                        json.command == undefined ||
                        json.command == '') {
                        socket_logger_1.default.warn(`[COMMAND] FRS randomseq : Command NULL`);
                        return;
                    }
                    socket_logger_1.default.debug(`[COMMAND] FRS randomseq: ${JSON.stringify(json)}`);
                    if (this.slamnav) {
                        this.slamnav.emit('randomseq', (0, network_util_1.stringifyAllValues)(json));
                    }
                    else {
                        this.frsSocket.emit('randomseqResponse', {
                            robotSerial: global.robotSerial,
                            data: {
                                ...data,
                                result: 'fail',
                                message: 'SLAMNAV2 disconnected',
                            },
                        });
                    }
                }
                catch (error) {
                    socket_logger_1.default.error(`[COMMAND] FRS randomseq: ${JSON.stringify(_data)}, ${(0, error_util_1.errorToJson)(error)}`);
                }
            });
            this.frsSocket.on('mapping', (_data) => {
                try {
                    if (_data == null || _data == undefined) {
                        socket_logger_1.default.warn(`[COMMAND] FRS mapping : NULL`);
                        return;
                    }
                    const data = _data;
                    const json = JSON.parse(data);
                    if (json.command == null ||
                        json.command == undefined ||
                        json.command == '') {
                        socket_logger_1.default.warn(`[COMMAND] FRS mapping : Command NULL`);
                        return;
                    }
                    socket_logger_1.default.debug(`[COMMAND] FRS mapping: ${JSON.stringify(json)}`);
                    if (this.slamnav) {
                        this.slamnav.emit('mapping', (0, network_util_1.stringifyAllValues)(json));
                    }
                    else {
                        this.frsSocket.emit('mappingResponse', {
                            robotSerial: global.robotSerial,
                            data: {
                                ...data,
                                result: 'fail',
                                message: 'SLAMNAV2 disconnected',
                            },
                        });
                    }
                }
                catch (error) {
                    socket_logger_1.default.error(`[COMMAND] FRS mapping: ${JSON.stringify(_data)}, ${(0, error_util_1.errorToJson)(error)}`);
                }
            });
            this.frsSocket.on('dock', (_data) => {
                try {
                    if (_data == null || _data == undefined) {
                        socket_logger_1.default.warn(`[COMMAND] FRS dock : NULL`);
                        return;
                    }
                    const data = _data;
                    const json = JSON.parse(data);
                    socket_logger_1.default.debug(`[COMMAND] FRS dock: ${JSON.stringify(json)}`);
                    if (this.slamnav) {
                        this.slamnav.emit('dock', (0, network_util_1.stringifyAllValues)(json));
                    }
                    else {
                        this.frsSocket.emit('dockResponse', {
                            robotSerial: global.robotSerial,
                            data: {
                                ...data,
                                result: 'fail',
                                message: 'SLAMNAV2 disconnected',
                            },
                        });
                    }
                }
                catch (error) {
                    socket_logger_1.default.error(`[COMMAND] FRS dock: ${JSON.stringify(_data)}, ${(0, error_util_1.errorToJson)(error)}`);
                }
            });
            this.frsSocket.on('lidarOnOff', (_data) => {
                try {
                    if (_data == null || _data == undefined) {
                        socket_logger_1.default.warn(`[COMMAND] FRS lidarOnOff : NULL`);
                        return;
                    }
                    const data = _data;
                    const json = JSON.parse(data);
                    socket_logger_1.default.debug(`[COMMAND] FRS lidarOnOff: ${JSON.stringify(json)}`);
                    if (this.slamnav) {
                        this.slamnav.emit('lidarOnOff', (0, network_util_1.stringifyAllValues)(json));
                    }
                }
                catch (error) {
                    socket_logger_1.default.error(`[COMMAND] FRS lidarOnOff: ${JSON.stringify(_data)}, ${(0, error_util_1.errorToJson)(error)}`);
                }
            });
            this.frsSocket.on('led', (_data) => {
                try {
                    if (_data == null || _data == undefined) {
                        socket_logger_1.default.warn(`[COMMAND] FRS led : NULL`);
                        return;
                    }
                    const data = _data;
                    const json = JSON.parse(data);
                    socket_logger_1.default.debug(`[COMMAND] FRS led: ${JSON.stringify(json)}`);
                    if (this.slamnav) {
                        this.slamnav.emit('led', (0, network_util_1.stringifyAllValues)(json));
                    }
                }
                catch (error) {
                    socket_logger_1.default.error(`[COMMAND] FRS led: ${JSON.stringify(_data)}, ${(0, error_util_1.errorToJson)(error)}`);
                }
            });
            this.frsSocket.on('pathOnOff', (_data) => {
                try {
                    if (_data == null || _data == undefined) {
                        socket_logger_1.default.warn(`[COMMAND] FRS pathOnOff : NULL`);
                        return;
                    }
                    const data = _data;
                    const json = JSON.parse(data);
                    socket_logger_1.default.debug(`[COMMAND] FRS pathOnOff: ${JSON.stringify(json)}`);
                    if (this.slamnav) {
                        this.slamnav.emit('pathOnOff', (0, network_util_1.stringifyAllValues)(json));
                    }
                }
                catch (error) {
                    socket_logger_1.default.error(`[COMMAND] FRS pathOnOff: ${JSON.stringify(_data)}, ${(0, error_util_1.errorToJson)(error)}`);
                }
            });
            this.frsSocket.on('path', (_data) => {
                try {
                    if (_data == null || _data == undefined) {
                        socket_logger_1.default.warn(`[COMMAND] FRS path : NULL`);
                        return;
                    }
                    const data = _data;
                    const json = JSON.parse(data);
                    if (isEqual(json, this.lastFRSPath)) {
                        socket_logger_1.default.warn(`[COMMAND] FRS path : Equal lastFRSPath`);
                        return;
                    }
                    this.lastFRSPath = json;
                    socket_logger_1.default.debug(`[COMMAND] FRS path: ${JSON.stringify(json)}`);
                    this.slamnav?.emit('path', (0, network_util_1.stringifyAllValues)(json));
                }
                catch (error) {
                    console.error(error);
                    socket_logger_1.default.error(`[COMMAND] FRS path: ${JSON.stringify(_data)}, ${(0, error_util_1.errorToJson)(error)}`);
                }
            });
            this.frsSocket.on('vobs', (_data) => {
                try {
                    if (_data == null || _data == undefined) {
                        socket_logger_1.default.warn(`[COMMAND] FRS vobs : NULL`);
                        return;
                    }
                    const data = _data;
                    const json = JSON.parse(data);
                    if (isEqual(json, this.lastFRSVobs)) {
                        socket_logger_1.default.warn(`[COMMAND] FRS vobs : Equal lastFRSvobs`);
                        return;
                    }
                    this.lastFRSVobs = json;
                    socket_logger_1.default.debug(`[COMMAND] FRS vobs: ${JSON.stringify(json)}`);
                    this.slamnav?.emit('vobs', (0, network_util_1.stringifyAllValues)(json));
                }
                catch (error) {
                    socket_logger_1.default.error(`[COMMAND] FRS vobs: ${JSON.stringify(_data)}, ${(0, error_util_1.errorToJson)(error)}`);
                }
            });
            this.frsSocket.on('vobsRobots', (_data) => {
                try {
                    if (_data == null || _data == undefined) {
                        socket_logger_1.default.warn(`[COMMAND] FRS vobsRobots : NULL`);
                        return;
                    }
                    const data = _data;
                    const json = JSON.parse(data);
                    if (isEqual(json, this.lastFRSVobsRobot)) {
                        socket_logger_1.default.warn(`[COMMAND] FRS vobsRobots : Equal lastFRSVobsRobot`);
                        return;
                    }
                    this.lastFRSVobsRobot = json;
                    socket_logger_1.default.debug(`[COMMAND] FRS vobsRobots: ${JSON.stringify(json)}`);
                    this.slamnav?.emit('vobsRobots', (0, network_util_1.stringifyAllValues)(json));
                }
                catch (error) {
                    socket_logger_1.default.error(`[COMMAND] FRS vobsRobots: ${JSON.stringify(_data)}, ${(0, error_util_1.errorToJson)(error)}`);
                }
            });
            this.frsSocket.on('vobsClosures', (_data) => {
                try {
                    if (_data == null || _data == undefined) {
                        socket_logger_1.default.warn(`[COMMAND] FRS vobsClosures : NULL`);
                        return;
                    }
                    const data = _data;
                    const json = JSON.parse(data);
                    if (isEqual(json, this.lastFRSVobsClosure)) {
                        socket_logger_1.default.warn(`[COMMAND] FRS vobsClosures : Equal lastFRSVobsClosure`);
                        return;
                    }
                    this.lastFRSVobsClosure = json;
                    socket_logger_1.default.debug(`[COMMAND] FRS vobsClosures: ${JSON.stringify(json)}`);
                    this.slamnav?.emit('vobsClosures', (0, network_util_1.stringifyAllValues)(json));
                }
                catch (error) {
                    socket_logger_1.default.error(`[COMMAND] FRS vobsClosures: ${JSON.stringify(_data)}, ${(0, error_util_1.errorToJson)(error)}`);
                }
            });
        }
        catch (error) {
            console.error(error);
            socket_logger_1.default.error(`[CONNECT] FRS Socket connect`);
            throw error;
        }
    }
    onModuleInit() {
        this.setConnectChecker();
    }
    onModuleDestroy() {
        (0, equipment_logger_1.generateGeneralLog)({
            logType: equipment_enum_1.GeneralLogType.MANUAL,
            status: equipment_enum_1.GeneralStatus.STOP,
            scope: equipment_enum_1.GeneralScope.EVENT,
            operationName: equipment_enum_1.GeneralOperationName.PROGRAM_END,
            operationStatus: equipment_enum_1.GeneralOperationStatus.SET,
        });
        socket_logger_1.default.warn(`[CONNECT] Socket Gateway Destroy`);
        this.frsSocket?.disconnect();
        clearInterval(this.interval_frs);
    }
    setConnectChecker() {
        this.connectChecker = setTimeout(() => {
            if (!this.slamnav) {
                socket_logger_1.default.error(`[CHECKER] connect Checker : Slamnav not connected`);
                this.setAlarmCode(2000);
            }
            else {
                socket_logger_1.default.debug(`[CHECKER] connect Checker : Slamnav connected`);
            }
            if (!this.acs) {
                socket_logger_1.default.error(`[CHECKER] connect Checker : acs not connected`);
            }
            else {
                socket_logger_1.default.debug(`[CHECKER] connect Checker : acs connected`);
            }
        }, 10000);
    }
    onApplicationShutdown(signal) {
        socket_logger_1.default.warn(`[CONNECT] Socket Gateway Shutdown Signal ${signal}`);
        this.frsSocket.disconnect();
        clearInterval(this.interval_frs);
    }
    handleConnection(client) {
        socket_logger_1.default.info(`[CONNECT] New Client: Name(${client.handshake.query.name}), IP(${client.handshake.address}), ID(${client.id})`);
        if (client.handshake.query.name == 'slamnav') {
            if (this.slamnav) {
                socket_logger_1.default.warn(`[CONNET] Slamnav already connected -> ignored `);
            }
            else {
                this.slamnav = client;
                this.frsSocket?.emit('slamRegist');
                clearTimeout(this.connectChecker);
                this.clearAlarmCode(2000);
            }
        }
        else if (client.handshake.query.name == 'taskman') {
            this.taskman = client;
            this.taskState.connection = true;
        }
        else if (client.handshake.query.name == 'streaming') {
            this.streaming = client;
        }
        else if (client.handshake.query.name == 'manipulator') {
            this.manipulator = client;
        }
        else if (client.handshake.query.name == 'torso') {
            this.torso = client;
        }
        else if (client.handshake.query.name == 'acs') {
            this.acs = client;
            this.clearAlarmCode(2000);
        }
        client.join(client.handshake.query.name);
    }
    handleDisconnect(client) {
        socket_logger_1.default.info(`[CONNECT] Client disconnected: Name(${client.handshake.query.name}), IP(${client.handshake.address}), ID(${client.id})`);
        if (client.handshake.query.name == 'slamnav') {
            if (this.slamnav) {
                if (this.slamnav.id === client.id) {
                    if (this.moveState.result == 'accept') {
                        this.server
                            .to(['moveResponse', 'all', 'move'])
                            .emit('moveResponse', {
                            robotSerial: global.robotSerial,
                            data: {
                                ...this.moveState,
                                result: 'fail',
                                message: 'disconnected',
                            },
                        });
                    }
                    if (this.tcpClient) {
                        socket_logger_1.default.debug(`[CONNECT] Send TCP : disconnected`);
                        this.tcpClient.write('disconnected');
                    }
                    this.frsSocket?.emit('slamUnregist');
                    this.slamnav = null;
                    this.setConnectChecker();
                    this.moveState = {
                        command: '',
                        id: undefined,
                        x: undefined,
                        y: undefined,
                        z: undefined,
                        rz: undefined,
                        preset: undefined,
                        method: undefined,
                        result: undefined,
                    };
                    if (this.taskState.running) {
                        this.server
                            .to(['taskStop', 'all', 'task'])
                            .emit('taskStop', 'disconnected');
                    }
                }
                else {
                    socket_logger_1.default.warn(`[CONNECT] Slamnav disconnected -> another one. ignored`);
                }
            }
        }
        else if (client.handshake.query.name == 'taskman') {
            this.taskState = {
                connection: false,
                file: '',
                id: 0,
                running: false,
                variables: [],
                result: undefined,
            };
            this.taskman = null;
        }
        else if (client.handshake.query.name == 'manipulator') {
            this.manipulator = null;
        }
        else if (client.handshake.query.name == 'torso') {
            this.torso = null;
        }
        client.leave(client.handshake.query.name);
    }
    async handelSubscribe(dto, client) {
        try {
            socket_logger_1.default.info(`[SUB] Client Subscribe ${client.id}, ${dto.topic}`);
            if (client.rooms.has(dto.topic)) {
                client.join(dto.topic);
                socket_logger_1.default.warn(`[SUB] Client Subscribe ${client.id} already in room ${dto.topic}`);
                return 'already in room';
            }
            else {
                client.join(dto.topic);
                return 'success';
            }
        }
        catch (error) {
            socket_logger_1.default.error(`[SUB] Client Subscribe ${client.id}, ${dto.topic} -> ${(0, error_util_1.errorToJson)(error)}`);
        }
    }
    async handelUnsubscribe(dto, client) {
        try {
            if (dto.topic == 'all') {
                socket_logger_1.default.info(`[SUB] Client Unsubscribe ${client.id} all : rooms size is ${client.rooms.size - 1}`);
                for (const room of client.rooms) {
                    if (room !== client.id) {
                        client.leave(room);
                    }
                }
                return 'success';
            }
            else {
                if (!client.rooms.has(dto.topic)) {
                    client.leave(dto.topic);
                    socket_logger_1.default.warn(`[SUB] Client Unsubscribe ${client.id} not in room ${dto.topic}`);
                    return 'not in room';
                }
                else {
                    client.leave(dto.topic);
                    socket_logger_1.default.info(`[SUB] Client Unsubscribe ${client.id}, ${dto.topic}`);
                    return 'success';
                }
            }
        }
        catch (error) {
            socket_logger_1.default.error(`[SUB] Client Unsubscribe ${client.id}, ${dto.topic} -> ${(0, error_util_1.errorToJson)(error)}`);
        }
    }
    async handleTaskStartMessage(payload) {
        try {
            this.taskState.file = payload.file;
            this.taskState.id = payload.id;
            this.taskState.running = payload.running;
            socket_logger_1.default.debug(`[RESPONSE] Task Start: ${JSON.stringify(payload)}`);
            this.server.to(['taskStart', 'all', 'task']).emit('taskStart', payload);
        }
        catch (error) {
            socket_logger_1.default.error(`[RESPONSE] Task Start: ${(0, error_util_1.errorToJson)(error)}`);
        }
    }
    async handleTaskDoneMessage(payload) {
        try {
            this.taskState.file = payload.file;
            this.taskState.id = payload.id;
            this.taskState.running = payload.running;
            socket_logger_1.default.debug(`[RESPONSE] Task Done : ${JSON.stringify(payload)}`);
            this.server.to(['taskDone', 'all', 'task']).emit('taskDone', payload);
        }
        catch (error) {
            socket_logger_1.default.error(`[RESPONSE] Task Done: ${(0, error_util_1.errorToJson)(error)}`);
        }
    }
    async handleTaskLoadMessage(payload) {
        try {
            this.taskState.file = payload.file;
            this.taskState.id = payload.id;
            this.taskState.running = payload.running;
            socket_logger_1.default.debug(`[RESPONSE] Task Load : ${JSON.stringify(payload)}`);
            this.server.to(['taskLoad', 'all', 'task']).emit('taskLoad', payload);
        }
        catch (error) {
            socket_logger_1.default.error(`[RESPONSE] Task Load: ${(0, error_util_1.errorToJson)(error)}`);
        }
    }
    async handleTaskErrorMessage(payload) {
        try {
            this.taskState.file = payload.file;
            this.taskState.id = payload.id;
            this.taskState.running = payload.running;
            socket_logger_1.default.debug(`[RESPONSE] Task Error : ${JSON.stringify(payload)}`);
            this.server.to(['taskError', 'all', 'task']).emit('taskError', payload);
        }
        catch (error) {
            socket_logger_1.default.error(`[RESPONSE] Task Error: ${(0, error_util_1.errorToJson)(error)}`);
            throw error();
        }
    }
    async handleTaskIdMessage(payload) {
        try {
            socket_logger_1.default.debug(`[RESPONSE] Task Id Change : ${JSON.stringify(payload)}`);
            this.taskState.id = payload;
            this.server.to(['taskId', 'all', 'task']).emit('taskId', payload);
        }
        catch (error) {
            socket_logger_1.default.error(`[RESPONSE] Task Id Change: ${(0, error_util_1.errorToJson)(error)}`);
            throw error();
        }
    }
    async handleMoveCommandMessage(payload) {
        try {
            if (payload == null || payload == undefined) {
                socket_logger_1.default.warn(`[COMMAND] Move: NULL`);
                return;
            }
            const json = JSON.parse(JSON.stringify(payload));
            socket_logger_1.default.debug(`[COMMAND] Move: ${JSON.stringify(json)}`);
            this.slamnav?.emit('move', (0, network_util_1.stringifyAllValues)(json));
        }
        catch (error) {
            socket_logger_1.default.error(`[COMMAND] Move: ${(0, error_util_1.errorToJson)(error)}`);
            throw error();
        }
    }
    async handleMoveCommandMessage2(payload) {
        try {
            if (payload == null || payload == undefined) {
                socket_logger_1.default.warn(`[COMMAND] Move: NULL`);
                return;
            }
            const json = JSON.parse(JSON.stringify(payload));
            socket_logger_1.default.debug(`[COMMAND] Move: ${JSON.stringify(json)}`);
            this.slamnav?.emit('move', (0, network_util_1.stringifyAllValues)(json));
        }
        catch (error) {
            socket_logger_1.default.error(`[COMMAND] Move: ${(0, error_util_1.errorToJson)(error)}`);
            throw error();
        }
    }
    async handleStatusMessage(payload, client) {
        try {
            if (client.id == this.slamnav?.id) {
                if (payload == null || payload == undefined) {
                    socket_logger_1.default.warn(`[STATUS] Status: NULL`);
                    return;
                }
                const json = JSON.parse(payload);
                const tempjson = { ...json };
                delete tempjson.time;
                if (isEqual(tempjson, this.lastStatus)) {
                    return;
                }
                if (this.lastStatus?.map.map_name !== tempjson.map.map_name) {
                    if (tempjson.map.map_name !== "") {
                        this.clearAlarmCode(2002);
                        this.clearAlarmCode(2003);
                        this.clearAlarmCode(2004);
                    }
                    else {
                        this.setAlarmCode(2003);
                    }
                }
                if (this.lastStatus?.robot_state.localization !== tempjson.robot_state.localization) {
                    if (tempjson.robot_state.localization === "good") {
                        this.clearAlarmCode(2001);
                    }
                    else {
                        this.setAlarmCode(2001);
                    }
                }
                if (this.lastStatus?.robot_state.emo !== tempjson.robot_state.emo) {
                    if (tempjson.robot_state.emo === "false") {
                        this.clearAlarmCode(3000);
                    }
                    else {
                        this.setAlarmCode(3000);
                    }
                }
                if (this.lastStatus?.power.bat_out !== tempjson.power.bat_out) {
                    if (parseFloat(tempjson.power.bat_out) < 43.4) {
                        this.setAlarmCode(4000);
                        this.clearAlarmCode(4002);
                        this.clearAlarmCode(4003);
                    }
                    else if (parseFloat(tempjson.power.bat_percent) < 5) {
                        this.setAlarmCode(4003);
                        this.clearAlarmCode(4000);
                        this.clearAlarmCode(4002);
                    }
                    else if (parseFloat(tempjson.power.bat_percent) < 15) {
                        this.setAlarmCode(4002);
                        this.clearAlarmCode(4000);
                        this.clearAlarmCode(4003);
                    }
                    else {
                        this.clearAlarmCode(4000);
                        this.clearAlarmCode(4002);
                        this.clearAlarmCode(4003);
                    }
                }
                if (this.lastStatus?.motor[0].current !== tempjson.motor[0].current) {
                    if (parseFloat(tempjson.motor[0].current) > 20 || parseFloat(tempjson.motor[1].current) > 20) {
                        this.setAlarmCode(4500);
                    }
                    else {
                        this.clearAlarmCode(4500);
                    }
                }
                if (this.lastStatus?.motor[0].temp !== tempjson.motor[0].temp) {
                    if (parseFloat(tempjson.motor[0].temp) > 60 || parseFloat(tempjson.motor[1].temp) > 60) {
                        this.setAlarmCode(4505);
                    }
                    else {
                        this.clearAlarmCode(4505);
                    }
                }
                if (this.lastStatus?.motor[0].status !== tempjson.motor[0].status) {
                    if (tempjson.motor[0].status === "1") {
                        this.clearAlarmCode(4515);
                    }
                    else {
                        this.setAlarmCode(4515);
                    }
                }
                if (this.lastStatus?.motor[1].status !== tempjson.motor[1].status) {
                    if (tempjson.motor[1].status === "1") {
                        this.clearAlarmCode(4514);
                    }
                    else {
                        this.setAlarmCode(4514);
                    }
                }
                if (this.lastStatus?.motor[0].connection !== tempjson.motor[0].connection || this.lastStatus?.motor[1].connection !== tempjson.motor[1].connection) {
                    if (tempjson.motor[0].connection === "true" && tempjson.motor[1].connection === "false") {
                        this.clearAlarmCode(4517);
                    }
                    else {
                        this.setAlarmCode(4517);
                    }
                }
                if (this.lastStatus?.lidar[0].connection !== tempjson.lidar[0].connection) {
                    if (tempjson.lidar[0].connection === "1") {
                        this.clearAlarmCode(5100);
                    }
                    else {
                        this.setAlarmCode(5100);
                    }
                }
                if (this.lastStatus?.lidar[1].connection !== tempjson.lidar[1].connection) {
                    if (tempjson.lidar[1].connection === "1") {
                        this.clearAlarmCode(5101);
                    }
                    else {
                        this.setAlarmCode(5101);
                    }
                }
                this.lastStatus = tempjson;
                this.server.to(['status', 'all', 'allStatus']).emit('status', json);
                if (this.frsSocket?.connected) {
                    this.frsSocket.emit('status', {
                        robotSerial: global.robotSerial,
                        data: json,
                    });
                }
                this.robotState = { ...this.robotState, ...json };
            }
            else {
                socket_logger_1.default.warn(`[STATUS] another slamnav status ${this.slamnav?.id}, ${client.id}`);
            }
        }
        catch (error) {
            socket_logger_1.default.error(`[STATUS] status : ${(0, error_util_1.errorToJson)(error)}`);
        }
    }
    async handleWorkingStatusMessage(payload, client) {
        try {
            if (client.id == this.slamnav?.id) {
                if (payload == null || payload == undefined) {
                    socket_logger_1.default.warn(`[STATUS] MoveStatus: NULL`);
                    return;
                }
                const json = JSON.parse(payload);
                const tempjson = { ...json };
                delete tempjson.time;
                if (isEqual(tempjson, this.lastMoveStatus)) {
                    return;
                }
                this.lastMoveStatus = tempjson;
                this.server
                    .to(['moveStatus', 'all', 'allStatus'])
                    .emit('moveStatus', json);
                if (this.frsSocket?.connected) {
                    this.frsSocket.emit('moveStatus', {
                        robotSerial: global.robotSerial,
                        data: json,
                    });
                }
                this.robotState = { ...this.robotState, ...json };
            }
        }
        catch (error) {
            socket_logger_1.default.error(`[STATUS] MoveStatus : ${(0, error_util_1.errorToJson)(error)}`);
        }
    }
    async handleMoveReponseMessage(payload, client) {
        try {
            if (client.id == this.slamnav?.id) {
                if (payload == null || payload == undefined) {
                    this.setAlarmLog(10002);
                    socket_logger_1.default.warn(`[RESPONSE] moveResponse: NULL`);
                    return;
                }
                const json = JSON.parse(payload);
                if (json.command == null ||
                    json.command == undefined ||
                    json.command == '') {
                    this.setAlarmLog(10002);
                    socket_logger_1.default.warn(`[RESPONSE] moveResponse: Command NULL`);
                    return;
                }
                if (json.result === "fail") {
                    if (json.message === "path out") {
                        this.setAlarmCode(2005);
                    }
                    else if (json.message === "localization fail") {
                        this.setAlarmCode(2006);
                    }
                    else if (json.message === "path not found") {
                        this.setAlarmCode(2018);
                    }
                    else if (json.message === "somthing wrong") {
                    }
                    else if (json.message === "not ready") {
                        this.setAlarmCode(2019);
                    }
                    else if (json.message === "manual stopped") {
                    }
                    else if (json.message === "bumper crash") {
                        this.setAlarmCode(3001);
                    }
                    else {
                    }
                }
                else if (json.result === "reject") {
                    if (json.message === "map not loaded") {
                        this.setAlarmCode(2003);
                    }
                    else if (json.message === "no localization") {
                        this.setAlarmCode(2020);
                    }
                    else if (json.message === "target location out of range") {
                        this.setAlarmCode(2018);
                    }
                    else if (json.message === "target location occupied") {
                        this.setAlarmCode(2021);
                    }
                    else if (json.message === "target command not supported by multi") {
                    }
                    else if (json.message === "not supported") {
                    }
                    else if (json.message === "can not find node") {
                        this.setAlarmCode(2018);
                    }
                    else if (json.message === "empty node id") {
                    }
                    else {
                        this.setAlarmCode(2021);
                    }
                }
                this.server
                    .to(['moveResponse', 'all', 'move'])
                    .emit('moveResponse', json);
                socket_logger_1.default.debug(`[RESPONSE] SLAMNAV Move: ${JSON.stringify(json)}`);
                if (json.command === 'goal' || json.command === 'target') {
                    if (json.result === 'success' || json.result === 'fail') {
                        (0, equipment_logger_1.generateGeneralLog)({
                            logType: equipment_enum_1.GeneralLogType.AUTO,
                            status: equipment_enum_1.GeneralStatus.RUN,
                            scope: equipment_enum_1.GeneralScope.VEHICLE,
                            operationName: equipment_enum_1.VehicleOperationName.MOVE,
                            operationStatus: equipment_enum_1.GeneralOperationStatus.END,
                        });
                    }
                    else if (json.result === 'accept') {
                        if ((0, equipment_logger_1.generateGeneralLog)({
                            logType: equipment_enum_1.GeneralLogType.AUTO,
                            status: equipment_enum_1.GeneralStatus.RUN,
                            scope: equipment_enum_1.GeneralScope.VEHICLE,
                            operationName: equipment_enum_1.VehicleOperationName.READY,
                            operationStatus: equipment_enum_1.GeneralOperationStatus.END,
                        })) {
                            (0, equipment_logger_1.generateGeneralLog)({
                                logType: equipment_enum_1.GeneralLogType.AUTO,
                                status: equipment_enum_1.GeneralStatus.RUN,
                                scope: equipment_enum_1.GeneralScope.VEHICLE,
                                operationName: equipment_enum_1.VehicleOperationName.MOVE,
                                operationStatus: equipment_enum_1.GeneralOperationStatus.START,
                            });
                        }
                    }
                    else if (json.result === 'reject') {
                        (0, equipment_logger_1.generateGeneralLog)({
                            logType: equipment_enum_1.GeneralLogType.AUTO,
                            status: equipment_enum_1.GeneralStatus.RUN,
                            scope: equipment_enum_1.GeneralScope.VEHICLE,
                            operationName: equipment_enum_1.VehicleOperationName.READY,
                            operationStatus: equipment_enum_1.GeneralOperationStatus.END,
                        });
                    }
                }
                if (this.frsSocket?.connected) {
                    this.frsSocket.emit('moveResponse', {
                        robotSerial: global.robotSerial,
                        data: json,
                    });
                }
                this.moveState = json;
            }
            else {
                socket_logger_1.default.warn(`[RESPONSE] another slamnav moveResponse ${this.slamnav?.id}, ${client.id}`);
            }
        }
        catch (error) {
            this.setAlarmLog(10000);
            socket_logger_1.default.error(`[RESPONSE] SLAMNAV Move: ${(0, error_util_1.errorToJson)(error)}`);
            throw error();
        }
    }
    async setSequence(data, scope) {
        try {
            if (scope === undefined || scope === "") {
                throw new microservices_1.RpcException('scope 값이 없습니다.');
            }
            if (!Object.values(["manipulator", "torso", "acs"]).includes(scope.toLowerCase())) {
                throw new microservices_1.RpcException('scope 값이 형식과 일치하지 않습니다.');
            }
            if (data.operationName === undefined || data.operationName === "") {
                throw new microservices_1.RpcException('operationName 값이 없습니다.');
            }
            if (data.operationStatus === undefined || data.operationStatus === "") {
                throw new microservices_1.RpcException('operationStatus 값이 없습니다.');
            }
            if (!Object.values(equipment_enum_1.GeneralOperationStatus).includes(data.operationStatus)) {
                throw new microservices_1.RpcException('operationStatus 값이 형식과 일치하지 않습니다.');
            }
            if (scope.toLowerCase() == "manipulator") {
                (0, equipment_logger_1.generateGeneralLog)({
                    logType: equipment_enum_1.GeneralLogType.AUTO,
                    status: equipment_enum_1.GeneralStatus.RUN,
                    scope: equipment_enum_1.GeneralScope.MANIPULATOR,
                    operationName: data.operationName,
                    operationStatus: data.operationStatus
                });
            }
            else if (scope.toLowerCase() == "torso") {
                (0, equipment_logger_1.generateGeneralLog)({
                    logType: equipment_enum_1.GeneralLogType.AUTO,
                    status: equipment_enum_1.GeneralStatus.RUN,
                    scope: equipment_enum_1.GeneralScope.TORSO,
                    operationName: data.operationName,
                    operationStatus: data.operationStatus
                });
            }
            else if (scope.toLowerCase() === "acs") {
                (0, equipment_logger_1.generateGeneralLog)({
                    logType: equipment_enum_1.GeneralLogType.AUTO,
                    status: equipment_enum_1.GeneralStatus.RUN,
                    scope: equipment_enum_1.GeneralScope.EVENT,
                    operationName: data.operationName,
                    operationStatus: data.operationStatus
                });
            }
            else {
                throw new microservices_1.RpcException('scope 값이 형식과 일치하지 않습니다.');
            }
            return;
        }
        catch (error) {
            socket_logger_1.default.error(`[LOG] setSequence : ${(0, error_util_1.errorToJson)(error)}`);
            if (error instanceof microservices_1.RpcException)
                throw error;
            throw new microservices_1.RpcException('서버에 에러가 발생했습니다.');
        }
    }
    async setAlarmCode(alarmCode) {
        this.setAlarm({ alarmCode: alarmCode.toString(), state: true });
    }
    async clearAlarmCode(alarmCode) {
    }
    async setAlarm(data) {
        try {
            const alarmDetail = await this.logService.getAlarmDetail(data.alarmCode);
            const lastAlarm = await this.logService.getLastAlarm(data.alarmCode);
            if (lastAlarm) {
                if (data.alarmCode === lastAlarm.alarmCode && data.state === lastAlarm.state) {
                    socket_logger_1.default.warn(`[LOG] duplicate alarm : ${data.alarmCode} -> ${alarmDetail.alarmDescription}`);
                    return;
                }
            }
            socket_logger_1.default.warn(`[LOG] set alarm : ${data.alarmCode} -> ${alarmDetail.alarmDescription}`);
            const alarmDto = { alarmCode: data.alarmCode, alarmDetail: data.alarmDetail, emitFlag: false, state: data.state };
            this.server.to(["alarm", "all"]).emit("alarm", alarmDto);
            this.logService.setAlarm(alarmDto);
            const alarmEntity = await this.logService.getAlarmDetail(data.alarmCode);
            (0, equipment_logger_1.setAlarmGeneralLog)(alarmEntity, equipment_enum_1.GeneralOperationStatus.SET);
        }
        catch (error) {
            socket_logger_1.default.error(`[LOG] setAlarm : ${(0, error_util_1.errorToJson)(error)}`);
            if (error instanceof microservices_1.RpcException)
                throw error;
            throw new microservices_1.RpcException('서버에 에러가 발생했습니다.');
        }
    }
    async setAlarmLog(code) {
        (0, equipment_logger_1.setAlarmGeneralLog)(await this.logService.getAlarmDetail(code), equipment_enum_1.GeneralOperationStatus.SET);
    }
    async clearAlarmLog(code) {
        (0, equipment_logger_1.setAlarmGeneralLog)(await this.logService.getAlarmDetail(code), equipment_enum_1.GeneralOperationStatus.END);
    }
    async startAlarmLog(code) {
        (0, equipment_logger_1.setAlarmGeneralLog)(await this.logService.getAlarmDetail(code), equipment_enum_1.GeneralOperationStatus.START);
    }
    async handleLoadReponseMessage(payload, client) {
        try {
            if (client.id == this.slamnav?.id) {
                if (payload == null || payload == undefined) {
                    socket_logger_1.default.warn(`[RESPONSE] loadResponse: NULL`);
                    return;
                }
                const json = JSON.parse(payload);
                if (json.command == null ||
                    json.command == undefined ||
                    json.command == '') {
                    socket_logger_1.default.warn(`[RESPONSE] loadResponse: Command NULL`);
                    return;
                }
                this.server.to(['loadResponse', 'all']).emit('loadResponse', json);
                if (json.result === "fail") {
                    if (json.message === "type error") {
                        this.setAlarmCode(2004);
                    }
                    else {
                        this.setAlarmCode(2002);
                    }
                }
                if (this.frsSocket?.connected) {
                    this.frsSocket.emit('loadResponse', {
                        robotSerial: global.robotSerial,
                        data: json,
                    });
                }
                if (this.tcpClient) {
                    socket_logger_1.default.debug(`[CONNECT] Send TCP : ${json.result}`);
                    this.tcpClient.write(json.result);
                }
                socket_logger_1.default.debug(`[RESPONSE] SLAMNAV loadResponse: ${JSON.stringify(json)}`);
            }
            else {
                socket_logger_1.default.warn(`[RESPONSE] another slamnav loadResponse ${this.slamnav?.id}, ${client.id}`);
            }
        }
        catch (error) {
            socket_logger_1.default.error(`[RESPONSE] SLAMNAV loadResponse: ${(0, error_util_1.errorToJson)(error)}`);
            throw error();
        }
    }
    async handleMappingReponseMessage(payload, client) {
        try {
            if (client.id == this.slamnav?.id) {
                if (payload == null || payload == undefined) {
                    socket_logger_1.default.warn(`[RESPONSE] mappingResponse: NULL`);
                    return;
                }
                const json = JSON.parse(payload);
                if (json.command == null ||
                    json.command == undefined ||
                    json.command == '') {
                    socket_logger_1.default.warn(`[RESPONSE] mappingResponse: Command NULL`);
                    return;
                }
                this.server
                    .to(['mappingResponse', 'all', 'mapping'])
                    .emit('mappingResponse', json);
                if (this.frsSocket?.connected) {
                    this.frsSocket.emit('mappingResponse', {
                        robotSerial: global.robotSerial,
                        data: json,
                    });
                }
                socket_logger_1.default.debug(`[RESPONSE] SLAMNAV mappingResponse: ${JSON.stringify(json)}`);
                if (json.command == 'save' && json.result == 'success') {
                    socket_logger_1.default.info(`[RESPONSE] SLAMNAV mappingResponse -> auto map load ${json.name}`);
                    this.slamnav?.emit('load', {
                        command: 'mapload',
                        name: json.name,
                        time: Date.now().toString(),
                    });
                }
            }
        }
        catch (error) {
            socket_logger_1.default.error(`[RESPONSE] SLAMNAV mappingResponse: ${(0, error_util_1.errorToJson)(error)}`);
            throw error();
        }
    }
    async handleLocalizationReponseMessage(payload) {
        try {
            if (payload == null || payload == undefined) {
                socket_logger_1.default.warn(`[RESPONSE] localizationResponse: NULL`);
                return;
            }
            const json = JSON.parse(payload);
            if (json.command == null ||
                json.command == undefined ||
                json.command == '') {
                socket_logger_1.default.warn(`[RESPONSE] localizationResponse: Command NULL`);
                return;
            }
            this.server
                .to(['localizationResponse', 'all'])
                .emit('localizationResponse', json);
            if (this.frsSocket?.connected) {
                this.frsSocket.emit('localizationResponse', {
                    robotSerial: global.robotSerial,
                    data: json,
                });
            }
            if (this.tcpClient) {
                socket_logger_1.default.debug(`[CONNECT] Send TCP : ${json.result}`);
                this.tcpClient.write(json.result);
            }
            socket_logger_1.default.debug(`[RESPONSE] SLAMNAV localizationResponse: ${JSON.stringify(json)}`);
        }
        catch (error) {
            socket_logger_1.default.error(`[RESPONSE] SLAMNAV localizationResponse: ${(0, error_util_1.errorToJson)(error)}`);
            throw error();
        }
    }
    async handleRandomseqReponseMessage(payload) {
        try {
            if (payload == null || payload == undefined) {
                socket_logger_1.default.warn(`[RESPONSE] randomseqResponse: NULL`);
                return;
            }
            const json = JSON.parse(payload);
            if (json.command == null ||
                json.command == undefined ||
                json.command == '') {
                socket_logger_1.default.warn(`[RESPONSE] randomseqResponse: Command NULL`);
                return;
            }
            this.server
                .to(['randomseqResponse', 'all'])
                .emit('randomseqResponse', json);
            if (this.frsSocket?.connected) {
                this.frsSocket.emit('randomseqResponse', {
                    robotSerial: global.robotSerial,
                    data: json,
                });
            }
            socket_logger_1.default.debug(`[RESPONSE] SLAMNAV randomseqResponse: ${JSON.stringify(json)}`);
        }
        catch (error) {
            socket_logger_1.default.error(`[RESPONSE] SLAMNAV randomseqResponse: ${(0, error_util_1.errorToJson)(error)}`);
            throw error();
        }
    }
    async handleDockReponseMessage(payload) {
        try {
            if (payload == null || payload == undefined) {
                socket_logger_1.default.warn(`[RESPONSE] dockResponse: NULL`);
                return;
            }
            const json = JSON.parse(payload);
            if (json.command == null ||
                json.command == undefined ||
                json.command == '') {
                socket_logger_1.default.warn(`[RESPONSE] dockResponse: Command NULL`);
                return;
            }
            if (json.result === "fail") {
                this.setAlarmCode(2007);
            }
            else if (json.result === 'reject') {
                this.setAlarmCode(2024);
            }
            this.server.to(['dockResponse', 'all']).emit('dockResponse', json);
            if (this.frsSocket?.connected) {
                this.frsSocket.emit('dockResponse', {
                    robotSerial: global.robotSerial,
                    data: json,
                });
            }
            if (this.tcpClient) {
                socket_logger_1.default.debug(`[CONNECT] Send TCP : ${json.result}`);
                this.tcpClient.write(json.result);
            }
            socket_logger_1.default.debug(`[RESPONSE] SLAMNAV dockResponse: ${JSON.stringify(json)}`);
        }
        catch (error) {
            socket_logger_1.default.error(`[RESPONSE] SLAMNAV dockResponse: ${(0, error_util_1.errorToJson)(error)}`);
            throw error();
        }
    }
    async handleLidarCloudMessage(payload) {
        try {
            if (payload == null || payload == undefined || payload.length == 0) {
                socket_logger_1.default.warn(`[STATUS] lidarCloud: NULL`);
                return;
            }
            if (isEqual(payload, this.lastLidarCloud)) {
                return;
            }
            this.lastLidarCloud = payload;
            this.server.to(['lidarCloud', 'all']).emit('lidarCloud', payload);
            if (this.frsSocket?.connected) {
            }
        }
        catch (error) {
            socket_logger_1.default.error(`[STATUS] Lidar: ${(0, error_util_1.errorToJson)(error)}`);
            throw error();
        }
    }
    async handleMappingCloudMessage(payload) {
        try {
            if (payload == null || payload == undefined || payload.length == 0) {
                socket_logger_1.default.warn(`[STATUS] mappingCloud: NULL`);
                return;
            }
            if (isEqual(payload, this.lastMappingCloud)) {
                socket_logger_1.default.warn(`[STATUS] mappingCloud: Equal lastMappingCloud`);
                return;
            }
            this.lastMappingCloud = payload;
            this.server.to(['mappingCloud', 'all']).emit('mappingCloud', payload);
        }
        catch (error) {
            socket_logger_1.default.error(`[STATUS] Mapping Cloud: ${(0, error_util_1.errorToJson)(error)}`);
            throw error();
        }
    }
    async handlePathResponse(payload) {
        if (payload == null ||
            payload == undefined ||
            payload.time == null ||
            payload.time == undefined ||
            payload.time == '') {
            socket_logger_1.default.warn(`[STATUS] pathResponse: NULL`);
            return;
        }
        const sendData = {
            robotSerial: global.robotSerial,
            data: payload,
        };
        this.frsSocket?.emit('pathResponse', sendData);
    }
    async handleLocalPathdMessage(payload) {
        try {
            if (payload == null || payload == undefined || payload.length == 0) {
                socket_logger_1.default.warn(`[STATUS] localPath: NULL`);
                return;
            }
            if (isEqual(payload, this.lastLocalPath)) {
                socket_logger_1.default.warn(`[STATUS] localPath: Equal localPath`);
                return;
            }
            this.lastLocalPath = payload;
            this.server.to(['localPath', 'all', 'path']).emit('localPath', payload);
        }
        catch (error) {
            socket_logger_1.default.error(`[STATUS] localPath: ${(0, error_util_1.errorToJson)(error)}`);
            throw error();
        }
    }
    async handleGlobalPathdMessage(payload) {
        try {
            if (payload == null || payload == undefined || payload.length == 0) {
                socket_logger_1.default.warn(`[STATUS] globalPath: NULL`);
                return;
            }
            if (isEqual(payload, this.lastGlobalPath)) {
                return;
            }
            this.lastGlobalPath = payload;
            this.server.to(['globalPath', 'all', 'path']).emit('globalPath', payload);
        }
        catch (error) {
            socket_logger_1.default.error(`[STATUS] globalPath: ${(0, error_util_1.errorToJson)(error)}`);
            throw error();
        }
    }
    async handleTaskInitMessage(payload) {
        try {
            this.taskState.file = payload.file;
            this.taskState.id = payload.id;
            this.taskState.running = payload.running;
            socket_logger_1.default.debug(`[INIT] Task Init: ${JSON.stringify(payload)}`);
            this.server
                .to(['taskInit', 'all', 'task'])
                .emit('taskInit', this.taskState);
        }
        catch (error) {
            socket_logger_1.default.error(`[INIT] Task Init: ${(0, error_util_1.errorToJson)(error)}`);
            throw error();
        }
    }
    async handleTaskVariablesMessage(payload) {
        try {
            this.taskState.variables = payload;
            socket_logger_1.default.debug(`[INIT] Task Variables: ${JSON.stringify(payload)}`);
            this.server
                .to(['taskVariables', 'all', 'task'])
                .emit('taskVariables', payload);
        }
        catch (error) {
            socket_logger_1.default.error(`[INIT] Task Variables:  ${(0, error_util_1.errorToJson)(error)}`);
            throw error();
        }
    }
    async handleTaskDockMessage() {
        try {
            socket_logger_1.default.debug(`[COMMAND] Task Dock`);
            this.slamnav?.emit('dock', {
                command: 'dock',
                time: Date.now().toString(),
            });
        }
        catch (error) {
            socket_logger_1.default.error(`[INIT] Task Dock:  ${(0, error_util_1.errorToJson)(error)}`);
            throw error();
        }
    }
    async handleTaskUnDockMessage() {
        try {
            socket_logger_1.default.debug(`[COMMAND] Task UnDock`);
            this.slamnav?.emit('dock', {
                command: 'undock',
                time: Date.now().toString(),
            });
        }
        catch (error) {
            socket_logger_1.default.error(`[INIT] Task UnDock:  ${(0, error_util_1.errorToJson)(error)}`);
            throw error();
        }
    }
    async handleMotionMessage(payload) {
        try {
            if (payload == null || payload == undefined) {
                socket_logger_1.default.warn(`[COMMAND] motion: NULL`);
                return;
            }
            const json = JSON.parse(JSON.stringify(payload));
            this.slamnav?.emit('motion', json);
            socket_logger_1.default.debug(`[COMMAND] Motion: ${JSON.stringify(json)}`);
        }
        catch (error) {
            socket_logger_1.default.error(`[INIT] Motion:  ${(0, error_util_1.errorToJson)(error)}`);
            throw error();
        }
    }
    async handleMotionResponseMessage(payload) {
        try {
            if (payload == null || payload == undefined) {
                socket_logger_1.default.warn(`[RESPONSE] motionResponse: NULL`);
                return;
            }
            const json = JSON.parse(payload);
            this.server
                .to(['motionResponse', 'all', 'motion'])
                .emit('motionResponse', json);
            if (this.frsSocket?.connected) {
                this.frsSocket.emit('motionResponse', {
                    robotSerial: global.robotSerial,
                    data: json,
                });
            }
            if (this.tcpClient) {
                socket_logger_1.default.debug(`[CONNECT] Send TCP : ${json.result}`);
                this.tcpClient.write(json.result);
            }
            this.motionState = json;
            socket_logger_1.default.debug(`[RESPONSE] SLAMNAV Motion: ${JSON.stringify(json)}`);
        }
        catch (error) {
            socket_logger_1.default.error(`[RESPONSE] SLAMNAV Motion: ${(0, error_util_1.errorToJson)(error)}`);
            throw error();
        }
    }
    async handleACSAutoRunStartMessage() {
        (0, equipment_logger_1.generateGeneralLog)({
            logType: equipment_enum_1.GeneralLogType.AUTO,
            status: equipment_enum_1.GeneralStatus.RUN,
            scope: equipment_enum_1.GeneralScope.EVENT,
            operationName: equipment_enum_1.GeneralOperationName.AUTORUN_START,
            operationStatus: equipment_enum_1.GeneralOperationStatus.SET,
        });
    }
    async handleACSAutoRunEndMessage() {
        (0, equipment_logger_1.generateGeneralLog)({
            logType: equipment_enum_1.GeneralLogType.AUTO,
            status: equipment_enum_1.GeneralStatus.RUN,
            scope: equipment_enum_1.GeneralScope.EVENT,
            operationName: equipment_enum_1.GeneralOperationName.AUTORUN_END,
            operationStatus: equipment_enum_1.GeneralOperationStatus.SET,
        });
    }
    async handleWebInitMessage() {
        try {
            const payload = {
                task: this.taskState,
                move: this.moveState,
                slam: this.robotState,
            };
            socket_logger_1.default.debug(`[INIT] Web Init : ${JSON.stringify(payload)}`);
            this.server.to(['Webinit', 'all']).emit('Webinit', payload);
        }
        catch (error) {
            socket_logger_1.default.error(`[INIT] Web Init: ${(0, error_util_1.errorToJson)(error)}`);
            throw error();
        }
    }
    async handleAlarmLogMessage(payload) {
        try {
            if (payload.state) {
                this.server.to(["alarm"]).emit('alarm', payload);
            }
            else {
                this.server.to(["alarm", "alarmClear"]).emit('alarmClear', payload);
            }
            this.logService.writeAlarmLog(payload.alarmCode, payload.alarmDetail, payload.state);
        }
        catch (error) {
            socket_logger_1.default.error(`[LOG] alarmLog: ${(0, error_util_1.errorToJson)(error)}`);
            throw error();
        }
    }
    async handleEquipmentLogMessage(payload) {
        if (typeof payload === 'string') {
            payload = JSON.parse(payload);
        }
        switch (payload.form) {
            case equipment_enum_1.FormType.MANIPULATOR:
                const parseManipulatorPosition = payload.data;
                if (parseManipulatorPosition.position === equipment_enum_1.ManipulatorType.LEFT) {
                    (0, equipment_logger_1.generateManipulatorLog)({
                        dateTime: parseManipulatorPosition.datetime,
                        x: parseManipulatorPosition.x,
                        y: parseManipulatorPosition.y,
                        z: parseManipulatorPosition.z,
                        rx: parseManipulatorPosition.rx,
                        ry: parseManipulatorPosition.ry,
                        rz: parseManipulatorPosition.rz,
                        base: parseManipulatorPosition.base,
                        shoulder: parseManipulatorPosition.shoulder,
                        elbow: parseManipulatorPosition.elbow,
                        wrist1: parseManipulatorPosition.wrist1,
                        wrist2: parseManipulatorPosition.wrist2,
                    }, `${equipment_enum_1.ManipulatorType.LEFT}_Manipulator_position`);
                }
                else if (parseManipulatorPosition.position === equipment_enum_1.ManipulatorType.RIGHT) {
                    (0, equipment_logger_1.generateManipulatorLog)({
                        dateTime: parseManipulatorPosition.datetime,
                        x: parseManipulatorPosition.x,
                        y: parseManipulatorPosition.y,
                        z: parseManipulatorPosition.z,
                        rx: parseManipulatorPosition.rx,
                        ry: parseManipulatorPosition.ry,
                        rz: parseManipulatorPosition.rz,
                        base: parseManipulatorPosition.base,
                        shoulder: parseManipulatorPosition.shoulder,
                        elbow: parseManipulatorPosition.elbow,
                        wrist1: parseManipulatorPosition.wrist1,
                        wrist2: parseManipulatorPosition.wrist2,
                    }, `${equipment_enum_1.ManipulatorType.RIGHT}_Manipulator_Position`);
                }
                break;
            case equipment_enum_1.FormType.TORSO:
                const parseTorsoPosition = payload.data;
                (0, equipment_logger_1.generateTorsoLog)({
                    dateTime: parseTorsoPosition.datetime,
                    x: parseTorsoPosition.x,
                    z: parseTorsoPosition.z,
                    theta: parseTorsoPosition.theta,
                }, `Torso_Position`);
                break;
            case equipment_enum_1.FormType.AMR:
                const parseData = payload.data;
                if (parseData.kind === equipment_enum_1.AmrLogType.VELOCITY) {
                    (0, equipment_logger_1.generateAmrVelocityLog)({
                        dateTime: parseData.datetime,
                        x: parseData.x,
                        y: parseData.y,
                        theta: parseData.theta,
                        xVel: parseData.xVel,
                        yVel: parseData.yVel,
                    }, `Mobile_Position_Velocity`);
                }
                else if (parseData.kind === equipment_enum_1.AmrLogType.OBSTACLE) {
                    (0, equipment_logger_1.generateAmrObstacleLog)({
                        dateTime: parseData.datetime,
                        statusFront: parseData.statusFront,
                        distanceFront: parseData.distanceFront,
                        thetaFront: parseData.thetaFront,
                        statusBack: parseData.statusBack,
                        distanceBack: parseData.distanceBack,
                        thetaBack: parseData.thetaBack,
                    }, `Lidar_Recognize_Obstacle`);
                }
                else if (parseData.kind === equipment_enum_1.AmrLogType.DOCKING_PRECISION) {
                    (0, equipment_logger_1.generateAmrDockingPrecisionLog)({
                        dateTime: parseData.datetime
                            .toISOString()
                            .replace('T', ' ')
                            .substring(0, 23),
                        twoDMarkerRecognizePosition: parseData.twoDMarkerRecognizePosition,
                    }, `Mobile_Charging_Docking_Precision`);
                }
                else if (parseData.kind === equipment_enum_1.AmrLogType.MOVING_PRECISION) {
                    (0, equipment_logger_1.generateAmrMovingPrecisionLog)({
                        dateTime: parseData.datetime
                            .toISOString()
                            .replace('T', ' ')
                            .substring(0, 23),
                        twoDMarkerRecognizePosition: parseData.twoDMarkerRecognizePosition,
                    }, `Mobile_Moving_Precision`);
                }
                break;
            default:
                break;
        }
    }
    getConnection() {
        return {
            SLAMNAV: this.slamnav ? true : false,
            TASK: this.taskman ? true : false,
        };
    }
};
exports.SocketGateway = SocketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SocketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [subscribe_dto_1.SubscribeDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handelSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribe'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [subscribe_dto_1.SubscribeDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handelUnsubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('taskStart'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleTaskStartMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('taskDone'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleTaskDoneMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('taskLoad'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleTaskLoadMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('taskError'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleTaskErrorMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('taskId'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleTaskIdMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('move'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleMoveCommandMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('moveCommand'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleMoveCommandMessage2", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('status'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleStatusMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('moveStatus'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleWorkingStatusMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('moveResponse'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleMoveReponseMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('loadResponse'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleLoadReponseMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mappingResponse'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleMappingReponseMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('localizationResponse'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleLocalizationReponseMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('randomseqResponse'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleRandomseqReponseMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('dockResponse'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleDockReponseMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('lidarCloud'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleLidarCloudMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mappingCloud'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleMappingCloudMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('pathResponse'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handlePathResponse", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('localPath'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleLocalPathdMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('globalPath'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleGlobalPathdMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('taskInit'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleTaskInitMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('taskVariables'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleTaskVariablesMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('taskDock'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleTaskDockMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('taskUndock'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleTaskUnDockMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('motion'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleMotionMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('motionResponse'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleMotionResponseMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('acsStart'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleACSAutoRunStartMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('acsEnd'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleACSAutoRunEndMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('Webinit'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleWebInitMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('alarm'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [alarm_dto_1.AlarmDto]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleAlarmLogMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('equipmentLog'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocketGateway.prototype, "handleEquipmentLogMessage", null);
exports.SocketGateway = SocketGateway = __decorate([
    (0, common_1.Global)(),
    (0, websockets_1.WebSocketGateway)(11337, {
        transports: ['websocket', 'polling'],
        cors: {
            origin: ['*', 'https://admin.socket.io'],
            credentials: true,
        },
        host: '0.0.0.0',
    }),
    __metadata("design:paramtypes", [network_service_1.NetworkService,
        log_service_1.LogService])
], SocketGateway);
//# sourceMappingURL=sockets.gateway.js.map