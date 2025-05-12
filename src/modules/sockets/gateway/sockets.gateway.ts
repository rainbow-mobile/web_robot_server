import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as ioClient from 'socket.io-client';
import { io } from 'socket.io-client';
import socketLogger from '@common/logger/socket.logger';
import { TaskPayload } from '@common/interface/robot/task.interface';
import { MovePayload } from '@common/interface/robot/move.interface';
import { StatusPayload } from '@common/interface/robot/status.interface';
import { stringifyAllValues } from '@common/util/network.util';
import { Global, OnModuleDestroy, Param, Query } from '@nestjs/common';
import { MqttClientService } from '@sockets/mqtt/mqtt.service';
import { errorToJson } from '@common/util/error.util';
import { KafkaClientService } from '@sockets/kafka/kafka.service';
import { NetworkService } from 'src/modules/apis/network/network.service';
import { instrument } from '@socket.io/admin-ui';
import * as net from 'net';
import { isEqual } from 'lodash';
import {
  MotionCommand,
  MotionMethod,
} from 'src/modules/apis/motion/dto/motion.dto';
import { MotionPayload } from '@common/interface/robot/motion.interface';
import { SubscribeDto } from '@sockets/dto/subscribe.dto';
@Global()
@WebSocketGateway(11337, {
  transports: ['websocket', 'polling'],
  cors: {
    origin: ['*', 'https://admin.socket.io'],
    credentials: true,
  },
  host: '0.0.0.0',
})
export class SocketGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleDestroy,
    OnGatewayInit
{
  constructor(
    private readonly networkService: NetworkService,
    // private readonly influxService: InfluxDBService,
    // private readonly mqttService: MqttClientService,
    // private readonly kafakService: KafkaClientService,
  ) {}

  afterInit() {
    instrument(this.server, {
      auth: false,
      mode: 'development',
    });
    // this.TCP_Open();
  }

  @WebSocketServer()
  server: Server; // WebSocket server 객체
  socket: Socket;
  tcpServer = null;
  tcpClient = null;

  slamnav: Socket;
  streaming: Socket;
  taskman: Socket;

  taskState: TaskPayload = {
    connection: false,
    file: '',
    id: 0,
    running: false,
    variables: [],
    result: undefined,
  };
  moveState: MovePayload = {
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
  motionState: MotionPayload = {
    command: MotionCommand.MOTION_GATE,
    method: MotionMethod.SITTING,
  };
  robotState: StatusPayload = {
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
      localization: 'none', // "none", "busy", "good", "fail"
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
  frsSocket: ioClient.Socket = null;
  lidarCloud: any[] = [];
  debugMode: boolean = false;

  //lastInputValue - SLAMNAV to RRS
  lastStatus:any;
  lastMoveStatus:any;
  lastLidarCloud:any;
  lastMappingCloud:any;
  lastLocalPath:any;
  lastGlobalPath:any;

  //lastInputValue - FRS to RRS
  lastFRSVobsRobot:any;
  lastFRSVobsClosure:any;
  lastFRSPath:any;

  //disabled(25-05-07, for traffic test)
  TCP_Open() {
    this.tcpServer = net.createServer((socket) => {
      this.tcpClient = socket;
      socketLogger.info(
        `[NETWORK] TCP Client Connected : ${socket.remoteAddress}`,
      );

      // 클라이언트로부터 데이터 수신
      this.tcpClient.on('data', (data) => {
        socketLogger.info(`[NETWORK] TCP Data in : ${data.toString()}`);
        try {
          const command = data.toString().split(' ')[0];
          const param = data.toString().split(' ')[1];

          console.log(data, command, param);
          if (command == 'req_status') {
            let data;
            if (param == 'slamnav') {
              data = this.slamnav ? 'connected' : 'disconnected';
              this.tcpClient.write(data);
            } else if (param == 'pose') {
              data =
                '{' +
                this.robotState.pose.x +
                ',' +
                this.robotState.pose.y +
                ',' +
                this.robotState.pose.rz +
                '}';
              this.tcpClient.write(data);
            } else if (param == 'map') {
              data =
                this.robotState.map.map_name == ''
                  ? 'not loaded'
                  : this.robotState.map.map_name;
              this.tcpClient.write(data);
            } else if (param == 'localization') {
              data = this.robotState.robot_state.localization;
              this.tcpClient.write(data);
            } else if (param == 'charge') {
              data = this.robotState.robot_state.charge;
              this.tcpClient.write(data);
            } else if (param == 'dock') {
              data = this.robotState.robot_state.dock;
              this.tcpClient.write(data);
            } else if (param == 'auto_move') {
              data = this.robotState.move_state.auto_move;
              this.tcpClient.write(data);
            } else if (param == 'path') {
              data = this.robotState.move_state.path;
              this.tcpClient.write(data);
            } else if (param == 'obs') {
              data = this.robotState.move_state.obs;
              this.tcpClient.write(data);
            } else if (param == 'cur_node_id') {
              data =
                this.robotState.cur_node.id == ''
                  ? '-'
                  : this.robotState.cur_node.id;
              this.tcpClient.write(data);
            } else if (param == 'cur_node_pose') {
              data =
                '{' +
                this.robotState.cur_node.x +
                ',' +
                this.robotState.cur_node.y +
                ',' +
                this.robotState.cur_node.rz +
                '}';
              this.tcpClient.write(data);
            } else if (param == 'goal_node_id') {
              data =
                this.robotState.goal_node.id == ''
                  ? '-'
                  : this.robotState.goal_node.id;
              this.tcpClient.write(data);
            } else if (param == 'goal_node_state') {
              data =
                this.robotState.goal_node.state == ''
                  ? 'none'
                  : this.robotState.goal_node.state;
              this.tcpClient.write(data);
            } else if (param == 'goal_node_pose') {
              data =
                '{' +
                this.robotState.goal_node.x +
                ',' +
                this.robotState.goal_node.y +
                ',' +
                this.robotState.goal_node.rz +
                '}';
              this.tcpClient.write(data);
            } else if (param == 'battery') {
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
          } else if (this.slamnav) {
            if (command == 'move') {
              let sendData;
              if (param == 'stop') {
                sendData = { command: param, time: Date.now().toString() };
              } else if (param == 'pause') {
                sendData = { command: param, time: Date.now().toString() };
              } else if (param == 'resume') {
                sendData = { command: param, time: Date.now().toString() };
              } else {
                sendData = {
                  command: 'goal',
                  goal_id: param,
                  method: 'pp',
                  preset: '0',
                  time: Date.now().toString(),
                };
              }
              console.log(
                'tcpClient command move : ',
                JSON.stringify(sendData),
              );
              this.slamnav?.emit('move', sendData);
            } else if (command == 'dock') {
              const sendData = {
                command: param,
              };
              console.log(
                'tcpClient command dock : ',
                JSON.stringify(sendData),
              );
              this.slamnav?.emit('dock', sendData);
            } else if (command == 'mapload') {
              const sendData = {
                command: command,
                name: param,
              };

              console.log(
                'tcpClient command load : ',
                JSON.stringify(sendData),
              );
              this.slamnav?.emit('load', sendData);
            } else if (command == 'localization') {
              let sendData;
              if (param == 'semiautoinit') {
                sendData = {
                  command: param,
                };
              } else if (param == 'autoinit') {
                sendData = {
                  command: param,
                };
              } else if (param == 'start') {
                sendData = {
                  command: param,
                };
              } else if (param == 'stop') {
                sendData = {
                  command: param,
                };
              } else if (param.split(',').length > 2) {
                sendData = {
                  command: 'init',
                  x: param.split(',')[0],
                  y: param.split(',')[1],
                  rz: param.split(',')[2],
                };
              } else {
                this.tcpClient.write('unknowncommand');
                return;
              }
              console.log(
                'tcpClient command localization : ',
                JSON.stringify(sendData),
              );
              this.slamnav?.emit('localization', sendData);
            } else {
              this.tcpClient.write('unknowncommand');
            }
          } else {
            this.tcpClient.write('disconnected');
          }
        } catch (error) {
          socketLogger.error(
            `[NETWORK] TCP Data Parse : ${errorToJson(error)}`,
          );
          this.tcpClient.write('error');
        }
        // // 클라이언트에 응답 전송
        // socket.write(`서버 응답: ${data}`);
      });

      // 클라이언트 연결 종료 처리
      this.tcpClient.on('end', () => {
        socketLogger.info(`[NETWORK] TCP Client Disconnected`);
      });

      // 에러 처리
      this.tcpClient.on('error', (err) => {
        socketLogger.error(`[NETWORK TCP Server Error : ${errorToJson(err)}]`);
      });
    });

    // 서버 시작
    this.tcpServer.listen('11338', '0.0.0.0', () => {
      socketLogger.info(`[NETWORK] TCP Server listen : 11338`);
    });

    // 서버 에러 처리
    this.tcpServer.on('error', (err) => {
      socketLogger.error(`[NETWORK] TCP Server error : ${errorToJson(err)}`);
    });
  }

  //disabled(25-05-07, for traffic test)
  setDebugMode(onoff: boolean) {
    socketLogger.info(`[COMMAND] setDebugMode : ${onoff}`);
    this.debugMode = false;// onoff;
  }

  async connectFrsSocket(url: string) {
    try {
      if (global.robotSerial == undefined || global.robotSerial == '') {
        socketLogger.warn(`[CONNECT] FRS Socket pass : robotSerial missing`);
        return;
      }

      if (this.frsSocket?.connected) {
        this.frsSocket.disconnect();
        socketLogger.info(`[CONNECT] FRS Socket disconnect`);
        this.frsSocket.close();
        global.frsConnect = false;
        this.frsSocket = null;
      }

      this.frsSocket = io(url, { transports: ['websocket'] });
      this.frsSocket.off();
      socketLogger.debug(
        `[CONNECT] FRS Socket URL: ${url}, ${global.robotSerial}`,
      );

      this.frsSocket.on('connect', () => {
        socketLogger.info(`[CONNECT] FRS Socket connected`);

        global.frsConnect = true;
        const sendData = {
          robotSerial: global.robotSerial
        };

        socketLogger.debug(`[CONNECT] FRS init : ${JSON.stringify(sendData)}`);
        this.frsSocket.emit('init', sendData);
      });

      this.frsSocket.on('disconnect', (data) => {
        socketLogger.error(
          `[CONNECT] FRS Socket disconnected: ${errorToJson(data)}`,
        );
        global.frsConnect = false;
      });

      this.frsSocket.on('error', (error) => {
        socketLogger.error(`[CONNECT] FRS Socket error: ${errorToJson(error)}`);
      });

      this.frsSocket.on('init', (_data) => {
        try {
          if(_data == null || _data == undefined){
            socketLogger.warn(`[INIT] Frs Init : NULL`);
            return;
          }
          const data = _data;
          const json = JSON.parse(data);
          if (json.robotSerial == global.robotSerial) {
            socketLogger.info(
              `[INIT] Get Robot Info from FRS: SerialNumber(${json.robotSerial}), ip(${json.robotIpAdrs}), name(${json.robotNm})`,
            );
            global.robotNm = json.robotNm;
          }
          //disabled(25-05-07, for traffic test)
          // this.mqttService.connect();
          // this.kafakService.connect();
        } catch (error) {
          socketLogger.error(
            `[INIT] FrsSocket init Error : ${JSON.stringify(_data)}, ${errorToJson(error)}`,
          );
        }
      });

      this.frsSocket.on('move', (_data) => {
        try {
          if(_data == null || _data == undefined ){
            socketLogger.warn(`[COMMAND] FRS Move : NULL`)
            return;
          }else{
            const data = _data;
            const json = JSON.parse(data);

            if(json.command == null || json.command == undefined || json.command == ""){
              socketLogger.warn(`[COMMAND] FRS Move : Command NULL`)
              return;
            }

            socketLogger.info(`[COMMAND] FRS Move: ${JSON.stringify(json)}`);
            if (this.slamnav) {
              this.slamnav?.emit('move', stringifyAllValues(json));
            } else {
              this.frsSocket.emit(
                'moveResponse',
                {
                  robotSerial: global.robotSerial,
                  data: {
                    ...data,
                    result: 'fail',
                    message: 'SLAMNAV2 disconnected',
                  },
                },
              );
            }
          }   
        } catch (error) {
          socketLogger.error(
            `[COMMAND] FRS Move: ${JSON.stringify(_data)}, ${errorToJson(error)}`,
          );
        }
      });

      this.frsSocket.on('load', (_data) => {
        try {
          if(_data == null || _data == undefined ){
            socketLogger.warn(`[COMMAND] FRS load : NULL`)
            return;
          }
          const data = _data;
          const json = JSON.parse(data);

          if(json.command == null || json.command == undefined || json.command == ""){
            socketLogger.warn(`[COMMAND] FRS load : Command NULL`)
            return;
          }
            
          socketLogger.debug(`[COMMAND] FRS Load: ${JSON.stringify(json)}`);
          if (this.slamnav) {
            this.slamnav.emit('load', stringifyAllValues(json));
          } else {
            this.frsSocket.emit(
              'loadResponse',
              {
                robotSerial: global.robotSerial,
                data: {
                  ...data,
                  result: 'fail',
                  message: 'SLAMNAV2 disconnected',
                },
              },
            );
          }
        } catch (error) {
          socketLogger.error(
            `[COMMAND] FRS MapLoad: ${JSON.stringify(_data)}, ${errorToJson(error)}`,
          );
        }
      });

      this.frsSocket.on('motor', (_data) => {
        try {
          if(_data == null || _data == undefined ){
            socketLogger.warn(`[COMMAND] FRS motor : NULL`)
            return;
          }
          const data = _data;
          const json = JSON.parse(data);

          if(json.command == null || json.command == undefined || json.command == ""){
            socketLogger.warn(`[COMMAND] FRS motor : Command NULL`)
            return;
          }
          socketLogger.debug(`[COMMAND] FRS motor: ${JSON.stringify(json)}`);
          if (this.slamnav) {
            this.slamnav.emit('motor', stringifyAllValues(json));
          } else {
            this.frsSocket.emit(
              'motorResponse',
              {
                robotSerial: global.robotSerial,
                data: {
                  ...data,
                  result: 'fail',
                  message: 'SLAMNAV2 disconnected',
                },
              },
            );
          }
        } catch (error) {
          socketLogger.error(
            `[COMMAND] FRS motor: ${JSON.stringify(_data)}, ${errorToJson(error)}`,
          );
        }
      });

      this.frsSocket.on('localization', (_data) => {
        try {
          if(_data == null || _data == undefined ){
            socketLogger.warn(`[COMMAND] FRS localization : NULL`)
            return;
          }
          const data = _data;
          const json = JSON.parse(data);

          if(json.command == null || json.command == undefined || json.command == ""){
            socketLogger.warn(`[COMMAND] FRS localization : Command NULL`)
            return;
          }
          socketLogger.debug(
            `[COMMAND] FRS Localization: ${JSON.stringify(json)}`,
          );
          if (this.slamnav) {
            this.slamnav.emit('localization', stringifyAllValues(json));
          } else {
            this.frsSocket.emit(
              'localizationResponse',
              {
                robotSerial: global.robotSerial,
                data: {
                  ...data,
                  result: 'fail',
                  message: 'SLAMNAV2 disconnected',
                },
              },
            );
          }
        } catch (error) {
          socketLogger.error(
            `[COMMAND] FRS Localization: ${JSON.stringify(_data)}, ${errorToJson(error)}`,
          );
        }
      });

      this.frsSocket.on('randomseq', (_data) => {
        try {
          if(_data == null || _data == undefined ){
            socketLogger.warn(`[COMMAND] FRS randomseq : NULL`)
            return;
          }
          const data = _data;
          const json = JSON.parse(data);

          if(json.command == null || json.command == undefined || json.command == ""){
            socketLogger.warn(`[COMMAND] FRS randomseq : Command NULL`)
            return;
          }
          socketLogger.debug(
            `[COMMAND] FRS randomseq: ${JSON.stringify(json)}`,
          );
          if (this.slamnav) {
            this.slamnav.emit('randomseq', stringifyAllValues(json));
          } else {
            this.frsSocket.emit(
              'randomseqResponse',
              {
                robotSerial: global.robotSerial,
                data: {
                  ...data,
                  result: 'fail',
                  message: 'SLAMNAV2 disconnected',
                },
              },
            );
          }
        } catch (error) {
          socketLogger.error(
            `[COMMAND] FRS randomseq: ${JSON.stringify(_data)}, ${errorToJson(error)}`,
          );
        }
      });

      this.frsSocket.on('mapping', (_data) => {
        try {
          if(_data == null || _data == undefined ){
            socketLogger.warn(`[COMMAND] FRS mapping : NULL`)
            return;
          }
          const data = _data;
          const json = JSON.parse(data);

          if(json.command == null || json.command == undefined || json.command == ""){
            socketLogger.warn(`[COMMAND] FRS mapping : Command NULL`)
            return;
          }
          socketLogger.debug(`[COMMAND] FRS mapping: ${JSON.stringify(json)}`);
          if (this.slamnav) {
            this.slamnav.emit('mapping', stringifyAllValues(json));
          } else {
            this.frsSocket.emit(
              'mappingResponse',
              {
                robotSerial: global.robotSerial,
                data: {
                  ...data,
                  result: 'fail',
                  message: 'SLAMNAV2 disconnected',
                },
              },
            );
          }
        } catch (error) {
          socketLogger.error(
            `[COMMAND] FRS mapping: ${JSON.stringify(_data)}, ${errorToJson(error)}`,
          );
        }
      });

      this.frsSocket.on('dock', (_data) => {
        try {
          if(_data == null || _data == undefined ){
            socketLogger.warn(`[COMMAND] FRS dock : NULL`)
            return;
          }
          const data = _data;
          const json = JSON.parse(data);

          socketLogger.debug(`[COMMAND] FRS dock: ${JSON.stringify(json)}`);
          if (this.slamnav) {
            this.slamnav.emit('dock', stringifyAllValues(json));
          } else {
            this.frsSocket.emit(
              'dockResponse',
              {
                robotSerial: global.robotSerial,
                data: {
                  ...data,
                  result: 'fail',
                  message: 'SLAMNAV2 disconnected',
                },
              },
            );
          }
        } catch (error) {
          socketLogger.error(
            `[COMMAND] FRS dock: ${JSON.stringify(_data)}, ${errorToJson(error)}`,
          );
        }
      });

      this.frsSocket.on('lidarOnOff', (_data) => {
        try {
          if(_data == null || _data == undefined ){
            socketLogger.warn(`[COMMAND] FRS lidarOnOff : NULL`)
            return;
          }
          const data = _data;
          const json = JSON.parse(data);
          socketLogger.debug(
            `[COMMAND] FRS lidarOnOff: ${JSON.stringify(json)}`,
          );
          if (this.slamnav) {
            this.slamnav.emit('lidarOnOff', stringifyAllValues(json));
          }
        } catch (error) {
          socketLogger.error(
            `[COMMAND] FRS lidarOnOff: ${JSON.stringify(_data)}, ${errorToJson(error)}`,
          );
        }
      });

      this.frsSocket.on('led', (_data) => {
        try {
          if(_data == null || _data == undefined ){
            socketLogger.warn(`[COMMAND] FRS led : NULL`)
            return;
          }
          const data = _data;
          const json = JSON.parse(data);
          socketLogger.debug(`[COMMAND] FRS led: ${JSON.stringify(json)}`);
          if (this.slamnav) {
            this.slamnav.emit('led', stringifyAllValues(json));
          }
        } catch (error) {
          socketLogger.error(
            `[COMMAND] FRS led: ${JSON.stringify(_data)}, ${errorToJson(error)}`,
          );
        }
      });

      this.frsSocket.on('pathOnOff', (_data) => {
        try {
          if(_data == null || _data == undefined ){
            socketLogger.warn(`[COMMAND] FRS pathOnOff : NULL`)
            return;
          }
          const data = _data;
          const json = JSON.parse(data);
          socketLogger.debug(
            `[COMMAND] FRS pathOnOff: ${JSON.stringify(json)}`,
          );
          if (this.slamnav) {
            this.slamnav.emit('pathOnOff', stringifyAllValues(json));
          }
        } catch (error) {
          socketLogger.error(
            `[COMMAND] FRS pathOnOff: ${JSON.stringify(_data)}, ${errorToJson(error)}`,
          );
        }
      });

      this.frsSocket.on('path', (_data) => {
        try {
          if(_data == null || _data == undefined ){
            socketLogger.warn(`[COMMAND] FRS path : NULL`)
            return;
          }
          const data = _data;
          const json = JSON.parse(data);

          if(isEqual(json,this.lastFRSPath)){
            socketLogger.warn(`[COMMAND] FRS path : Equal lastFRSPath`)
            return;
          }
          this.lastFRSPath = json;
          socketLogger.debug(`[COMMAND] FRS path: ${JSON.stringify(json)}`);
          this.slamnav?.emit('path', stringifyAllValues(json));
        } catch (error) {
          console.error(error);
          socketLogger.error(
            `[COMMAND] FRS path: ${JSON.stringify(_data)}, ${errorToJson(error)}`,
          );
        }
      });

      this.frsSocket.on('vobsRobots', (_data) => {
        try {
          if(_data == null || _data == undefined ){
            socketLogger.warn(`[COMMAND] FRS vobsRobots : NULL`)
            return;
          }
          const data = _data;
          const json = JSON.parse(data);
          if(isEqual(json,this.lastFRSVobsRobot)){
            socketLogger.warn(`[COMMAND] FRS vobsRobots : Equal lastFRSVobsRobot`)
            return;
          }
          this.lastFRSVobsRobot = json;
          socketLogger.debug(`[COMMAND] FRS vobsRobots: ${JSON.stringify(json)}`);
          this.slamnav?.emit('vobsRobots', stringifyAllValues(json));
        } catch (error) {
          socketLogger.error(
            `[COMMAND] FRS vobsRobots: ${JSON.stringify(_data)}, ${errorToJson(error)}`,
          );
        }
      });

      this.frsSocket.on('vobsClosures', (_data) => {
        try {
          if(_data == null || _data == undefined ){
            socketLogger.warn(`[COMMAND] FRS vobsClosures : NULL`)
            return;
          }
          const data = _data;
          const json = JSON.parse(data);

          if(isEqual(json,this.lastFRSVobsClosure)){
            socketLogger.warn(`[COMMAND] FRS vobsClosures : Equal lastFRSVobsClosure`)
            return;
          }
          this.lastFRSVobsClosure = json;
          socketLogger.debug(`[COMMAND] FRS vobsClosures: ${JSON.stringify(json)}`);
          this.slamnav?.emit('vobsClosures', stringifyAllValues(json));
        } catch (error) {
          socketLogger.error(
            `[COMMAND] FRS vobsClosures: ${JSON.stringify(_data)}, ${errorToJson(error)}`,
          );
        }
      });
    } catch (error) {
      console.error(error);
      socketLogger.error(`[CONNECT] FRS Socket connect`);
      throw error;
    }
  }

  interval_frs = setInterval(() => {
    const statusData = {
      robotSerial: global.robotSerial,
      data: {
        slam: { connection: this.slamnav ? true : false },
        task: this.taskState,
        frs: this.frsSocket?.connected,
        time: Date.now().toString(),
      },
    };

    this.server.to(['programStatus','all','allStatus']).emit('programStatus', statusData.data);

    if (this.frsSocket?.connected && global.robotSerial != '') {
      this.frsSocket.emit('programStatus',statusData);
    }

  //interval changed (25-05-07 for traffic test)
  }, 5000);

  onModuleDestroy() {
    socketLogger.warn(`[CONNECT] Socket Gateway Destroy`);
    this.frsSocket.disconnect();
    clearInterval(this.interval_frs);
  }

  // 클라이언트가 연결되면 룸에 join 시킬 수 있음
  handleConnection(client: Socket) {
    socketLogger.info(
      `[CONNECT] New Client: Name(${client.handshake.query.name}), IP(${client.handshake.address}), ID(${client.id})`,
    );
    if (client.handshake.query.name == 'slamnav') {
      if(this.slamnav){
        socketLogger.warn(`[CONNET] Slamnav already connected -> ignored `)
      }else{
        this.slamnav = client;
        this.frsSocket?.emit('slamRegist');
      }
    } else if (client.handshake.query.name == 'taskman') {
      this.taskman = client;
      this.taskState.connection = true;
      // this.taskman.emit('file')
    } else if (client.handshake.query.name == 'streaming') {
      this.streaming = client;
    }
    client.join(client.handshake.query.name);
  }

  // 클라이언트가 연결 해제되면 룸에서 leave 시킬 수 있음
  handleDisconnect(client: Socket) {
    socketLogger.info(
      `[CONNECT] Client disconnected: Name(${client.handshake.query.name}), IP(${client.handshake.address}), ID(${client.id})`,
    );  ``

    if (client.handshake.query.name == 'slamnav') {

      if(this.slamnav){
        if(this.slamnav.id === client.id){
          if (this.moveState.result == 'accept') {
            this.server.to(['moveResponse','all','move']).emit('moveResponse', {
              robotSerial: global.robotSerial,
              data: {
                ...this.moveState,
                result: 'fail',
                message: 'disconnected',
              },
            });
          }
    
          if (this.tcpClient) {
            socketLogger.debug(`[CONNECT] Send TCP : disconnected`);
            this.tcpClient.write('disconnected');
          }
    
          this.frsSocket?.emit('slamUnregist');
          this.slamnav = null;
          
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

          
    
          //TaskStop
          if (this.taskState.running) {
            this.server.to(['taskStop','all','task']).emit('taskStop', 'disconnected');
          }
        }else{
          socketLogger.warn(`[CONNECT] Slamnav disconnected -> another one. ignored`)
        }
      }

    } else if (client.handshake.query.name == 'taskman') {
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
    client.leave(client.handshake.query.name as string);
  }


  // 클라이언트가 해당 토픽 구독
  @SubscribeMessage('subscribe')
  async handelSubscribe(@MessageBody() dto:SubscribeDto , @ConnectedSocket() client: Socket){
    try{
      if (client.rooms.has(dto.topic)) {
        client.join(dto.topic);
        socketLogger.warn(`[SUB] Client Subscribe ${client.id} already in room ${dto.topic}`)
        return 'already in room';
      }else{
        client.join(dto.topic);
        socketLogger.info(`[SUB] Client Subscribe ${client.id}, ${dto.topic}`)
        return 'success';
      }
    }catch(error){
      socketLogger.error(`[SUB] Client Subscribe ${client.id}, ${dto.topic} -> ${errorToJson(error)}`);
    }
  }

  // 클라이언트가 해당 토픽 구독해제
  @SubscribeMessage('unsubscribe')
  async handelUnsubscribe(@MessageBody() dto:SubscribeDto , @ConnectedSocket() client: Socket){
    try{
      if (!client.rooms.has(dto.topic)) {
        client.leave(dto.topic);
        socketLogger.warn(`[SUB] Client Unsubscribe ${client.id} not in room ${dto.topic}`)
        return 'not in room';
      }else{
        client.leave(dto.topic);
        socketLogger.info(`[SUB] Client Unsubscribe ${client.id}, ${dto.topic}`)
        return 'success';
      }
    }catch(error){
      socketLogger.error(`[SUB] Client Unsubscribe ${client.id}, ${dto.topic} -> ${errorToJson(error)}`);
    }
  }

  /**
   * @description 태스크 시작/종료/에러 메시지를 처리하는 함수
   * @param socket
   * @param payload 로봇 라이다 데이터
   */
  @SubscribeMessage('taskStart')
  async handleTaskStartMessage(
    @MessageBody()
    payload: TaskPayload,
  ) {
    try {
      this.taskState.file = payload.file;
      this.taskState.id = payload.id;
      this.taskState.running = payload.running;
      socketLogger.debug(`[RESPONSE] Task Start: ${JSON.stringify(payload)}`);
      this.server.to(['taskStart','all','task']).emit('taskStart', payload);
    } catch (error) {
      socketLogger.error(`[RESPONSE] Task Start: ${errorToJson(error)}`);
    }
  }
  @SubscribeMessage('taskDone')
  async handleTaskDoneMessage(
    @MessageBody()
    payload: TaskPayload,
  ) {
    try {
      this.taskState.file = payload.file;
      this.taskState.id = payload.id;
      this.taskState.running = payload.running;
      socketLogger.debug(`[RESPONSE] Task Done : ${JSON.stringify(payload)}`);
      this.server.to(['taskDone','all','task']).emit('taskDone', payload);
    } catch (error) {
      socketLogger.error(`[RESPONSE] Task Done: ${errorToJson(error)}`);
    }
  }
  @SubscribeMessage('taskLoad')
  async handleTaskLoadMessage(@MessageBody() payload: TaskPayload) {
    try {
      this.taskState.file = payload.file;
      this.taskState.id = payload.id;
      this.taskState.running = payload.running;
      socketLogger.debug(`[RESPONSE] Task Load : ${JSON.stringify(payload)}`);
      this.server.to(['taskLoad','all','task']).emit('taskLoad', payload);
    } catch (error) {
      socketLogger.error(`[RESPONSE] Task Load: ${errorToJson(error)}`);
    }
  }

  @SubscribeMessage('taskError')
  async handleTaskErrorMessage(
    @MessageBody()
    payload: TaskPayload,
  ) {
    try {
      this.taskState.file = payload.file;
      this.taskState.id = payload.id;
      this.taskState.running = payload.running;
      socketLogger.debug(`[RESPONSE] Task Error : ${JSON.stringify(payload)}`);
      this.server.to(['taskError','all','task']).emit('taskError', payload);
    } catch (error) {
      socketLogger.error(`[RESPONSE] Task Error: ${errorToJson(error)}`);
      throw error();
    }
  }

  /**
   * @description 태스크 아이디 변경 메시지를 처리하는 함수
   * @param socket
   * @param payload 태스크 아이디
   */
  @SubscribeMessage('taskId')
  async handleTaskIdMessage(@MessageBody() payload: number) {
    try {
      socketLogger.debug(
        `[RESPONSE] Task Id Change : ${JSON.stringify(payload)}`,
      );
      this.taskState.id = payload;
      this.server.to(['taskId','all','task']).emit('taskId', payload);
    } catch (error) {
      socketLogger.error(`[RESPONSE] Task Id Change: ${errorToJson(error)}`);
      throw error();
    }
  }

  /**
   * @description 태스크 이동 메시지를 처리하는 함수
   * @param socket
   * @param payload 로봇 이동 변수
   */
  @SubscribeMessage('move')
  async handleMoveCommandMessage(@MessageBody() payload: string) {
    try {
      if(payload == null || payload == undefined){
        socketLogger.warn(`[COMMAND] Move: NULL`);
        return;
      }

      const json = JSON.parse(JSON.stringify(payload));

      socketLogger.debug(`[COMMAND] Move: ${JSON.stringify(json)}`);
      this.slamnav?.emit('move', stringifyAllValues(json));
    } catch (error) {
      socketLogger.error(`[COMMAND] Move: ${errorToJson(error)}`);
      throw error();
    }
  }

  /**
   * @description 태스크 이동 메시지를 처리하는 함수
   * @param socket
   * @param payload 로봇 이동 변수
   */
  @SubscribeMessage('moveCommand')
  async handleMoveCommandMessage2(@MessageBody() payload: string) {
    try {
      if(payload == null || payload == undefined){
        socketLogger.warn(`[COMMAND] Move: NULL`);
        return;
      }

      const json = JSON.parse(JSON.stringify(payload));
      // if(isEqual(json,this.lastMoveRequest)){
      //   socketLogger.warn(`[COMMAND] Move: Equal lastMoveRequest`);
      //   return;
      // }
      // this.lastMoveRequest = json;

      socketLogger.debug(`[COMMAND] Move: ${JSON.stringify(json)}`);
      this.slamnav?.emit('move', stringifyAllValues(json));
    } catch (error) {
      socketLogger.error(`[COMMAND] Move: ${errorToJson(error)}`);
      throw error();
    }
  }

  @SubscribeMessage('status')
  async handleStatusMessage(@MessageBody() payload: string,
  @ConnectedSocket() client: Socket) {
    try{
      if(client.id == this.slamnav?.id){
        if(payload == null || payload == undefined){
          socketLogger.warn(`[STATUS] Status: NULL`);
          return;
        }
  
        const json = JSON.parse(payload);
        if(isEqual(json,this.lastStatus)){
          return;
        }
        this.lastStatus = json;
  
        this.server.to(['status','all','allStatus']).emit('status', json);
        if (this.frsSocket?.connected) {
          this.frsSocket.emit('status',{ robotSerial: global.robotSerial, data: json });
        }
  
        this.robotState = { ...this.robotState, ...json };
      }else{
        socketLogger.warn(`[STATUS] another slamnav status ${this.slamnav?.id}, ${client.id}`)
      }
    }catch(error){
      socketLogger.error(`[STATUS] status : ${errorToJson(error)}`)
    }

  }

  @SubscribeMessage('moveStatus')
  async handleWorkingStatusMessage(@MessageBody() payload: string,
  @ConnectedSocket() client: Socket) {
    try{
      if(client.id == this.slamnav?.id){
        if(payload == null || payload == undefined){
          socketLogger.warn(`[STATUS] MoveStatus: NULL`);
          return;
        }
  
        const json = JSON.parse(payload);
        // delete json.time;
        if(isEqual(json,this.lastMoveStatus)){
          // socketLogger.warn(`[STATUS] MoveStatus: Equal`)
          return;
        }
        this.lastMoveStatus = json;
  
        this.server.to(['moveStatus','all','allStatus']).emit('moveStatus',json);
        // socketLogger.debug(`[STATUS] MoveStatus : ${json.time}`)
        if (this.frsSocket?.connected) {
          this.frsSocket.emit('moveStatus',{ robotSerial: global.robotSerial, data: json });
        }
  
      // this.influxService.writeMoveStatus(json);
        this.robotState = { ...this.robotState, ...json };
      }
    }catch(error){
      socketLogger.error(`[STATUS] MoveStatus : ${errorToJson(error)}`)
    }
  }

  /**
   * @description SLAMNAV의 이동 응답 메시지를 처리하는 함수
   * @param socket
   * @param payload 로봇 이동 변수
   */
  @SubscribeMessage('moveResponse')
  async handleMoveReponseMessage(@MessageBody() payload: string,
    @ConnectedSocket() client: Socket) {
    try {
      if(client.id == this.slamnav?.id){
        if(payload == null || payload == undefined){
          socketLogger.warn(`[RESPONSE] moveResponse: NULL`);
          return;
        }
  
        const json = JSON.parse(payload);
  
        if(json.command == null || json.command == undefined || json.command == ""){
          socketLogger.warn(`[RESPONSE] moveResponse: Command NULL`);
          return;
        }
  
        this.server.to(['moveResponse','all','move']).emit('moveResponse', json);
        socketLogger.debug(`[RESPONSE] SLAMNAV Move: ${JSON.stringify(json)}`);
        
        if (this.frsSocket?.connected) {
          this.frsSocket.emit(
            'moveResponse',
            { robotSerial: global.robotSerial, data: json },
          );
        }
  
        this.moveState = json;
      }else{
        socketLogger.warn(`[RESPONSE] another slamnav moveResponse ${this.slamnav?.id}, ${client.id}`)
      }
    } catch (error) {
      socketLogger.error(`[RESPONSE] SLAMNAV Move: ${errorToJson(error)}`);
      throw error();
    }
  }

  @SubscribeMessage('loadResponse')
  async handleLoadReponseMessage(@MessageBody() payload: string,
    @ConnectedSocket() client: Socket) {
    try {
      if(client.id == this.slamnav?.id){
        if(payload == null || payload == undefined){
          socketLogger.warn(`[RESPONSE] loadResponse: NULL`);
          return;
        }
  
        const json = JSON.parse(payload);
        
        if(json.command == null || json.command == undefined || json.command == ""){
          socketLogger.warn(`[RESPONSE] loadResponse: Command NULL`);
          return;
        }
  
        this.server.to(['loadResponse','all']).emit('loadResponse', json);
  
        if (this.frsSocket?.connected) {
          this.frsSocket.emit(
            'loadResponse',
            { robotSerial: global.robotSerial, data: json },
          );
        }
  
        if (this.tcpClient) {
          socketLogger.debug(`[CONNECT] Send TCP : ${json.result}`);
          this.tcpClient.write(json.result);
        }
  
        socketLogger.debug(
          `[RESPONSE] SLAMNAV loadResponse: ${JSON.stringify(json)}`,
        );
      }else{
        socketLogger.warn(`[RESPONSE] another slamnav loadResponse ${this.slamnav?.id}, ${client.id}`)
      }
    } catch (error) {
      socketLogger.error(
        `[RESPONSE] SLAMNAV loadResponse: ${errorToJson(error)}`,
      );
      throw error();
    }
  }
  @SubscribeMessage('mappingResponse')
  async handleMappingReponseMessage(@MessageBody() payload: string,
    @ConnectedSocket() client: Socket) {
    try {
      if(client.id == this.slamnav?.id){
        if(payload == null || payload == undefined){
          socketLogger.warn(`[RESPONSE] mappingResponse: NULL`);
          return;
        }
  
        const json = JSON.parse(payload);
  
        if(json.command == null || json.command == undefined || json.command == ""){
          socketLogger.warn(`[RESPONSE] mappingResponse: Command NULL`);
          return;
        }
  
        this.server.to(['mappingResponse','all','mapping']).emit('mappingResponse', json);
  
        if (this.frsSocket?.connected) {
          this.frsSocket.emit(
            'mappingResponse',
            { robotSerial: global.robotSerial, data: json },
          );
        }
        socketLogger.debug(
          `[RESPONSE] SLAMNAV mappingResponse: ${JSON.stringify(json)}`,
        );
  
        if (json.command == 'save' && json.result == 'success') {
          socketLogger.info(
            `[RESPONSE] SLAMNAV mappingResponse -> auto map load ${json.name}`,
          );
          this.slamnav?.emit('load', {
            command: 'mapload',
            name: json.name,
            time: Date.now().toString(),
          });
        }
      }

    } catch (error) {
      socketLogger.error(
        `[RESPONSE] SLAMNAV mappingResponse: ${errorToJson(error)}`,
      );
      throw error();
    }
  }

  @SubscribeMessage('localizationResponse')
  async handleLocalizationReponseMessage(@MessageBody() payload: string) {
    try {
      if(payload == null || payload == undefined){
        socketLogger.warn(`[RESPONSE] localizationResponse: NULL`);
        return;
      }

      const json = JSON.parse(payload);

      if(json.command == null || json.command == undefined || json.command == ""){
        socketLogger.warn(`[RESPONSE] localizationResponse: Command NULL`);
        return;
      }
      
      this.server.to(['localizationResponse','all']).emit('localizationResponse', json);

      if (this.frsSocket?.connected) {
        this.frsSocket.emit(
          'localizationResponse',
          { robotSerial: global.robotSerial, data: json },
        );
      }

      if (this.tcpClient) {
        socketLogger.debug(`[CONNECT] Send TCP : ${json.result}`);
        this.tcpClient.write(json.result);
      }
      socketLogger.debug(
        `[RESPONSE] SLAMNAV localizationResponse: ${JSON.stringify(json)}`,
      );
    } catch (error) {
      socketLogger.error(
        `[RESPONSE] SLAMNAV localizationResponse: ${errorToJson(error)}`,
      );
      throw error();
    }
  }

  @SubscribeMessage('randomseqResponse')
  async handleRandomseqReponseMessage(@MessageBody() payload: string) {
    try {
      if(payload == null || payload == undefined){
        socketLogger.warn(`[RESPONSE] randomseqResponse: NULL`);
        return;
      }

      const json = JSON.parse(payload);

      if(json.command == null || json.command == undefined || json.command == ""){
        socketLogger.warn(`[RESPONSE] randomseqResponse: Command NULL`);
        return;
      }
      this.server.to(['randomseqResponse','all']).emit('randomseqResponse', json);

      if (this.frsSocket?.connected) {
        this.frsSocket.emit(
          'randomseqResponse',
          { robotSerial: global.robotSerial, data: json },
        );
      }
      socketLogger.debug(
        `[RESPONSE] SLAMNAV randomseqResponse: ${JSON.stringify(json)}`,
      );
    } catch (error) {
      socketLogger.error(
        `[RESPONSE] SLAMNAV randomseqResponse: ${errorToJson(error)}`,
      );
      throw error();
    }
  }
  @SubscribeMessage('dockResponse')
  async handleDockReponseMessage(@MessageBody() payload: string) {
    try {
      if(payload == null || payload == undefined){
        socketLogger.warn(`[RESPONSE] dockResponse: NULL`);
        return;
      }

      const json = JSON.parse(payload);

      if(json.command == null || json.command == undefined || json.command == ""){
        socketLogger.warn(`[RESPONSE] dockResponse: Command NULL`);
        return;
      }

      this.server.to(['dockResponse','all']).emit('dockResponse', json);

      if (this.frsSocket?.connected) {
        this.frsSocket.emit(
          'dockResponse',
          { robotSerial: global.robotSerial, data: json },
        );
      }
      if (this.tcpClient) {
        socketLogger.debug(`[CONNECT] Send TCP : ${json.result}`);
        this.tcpClient.write(json.result);
      }
      socketLogger.debug(
        `[RESPONSE] SLAMNAV dockResponse: ${JSON.stringify(json)}`,
      );
    } catch (error) {
      socketLogger.error(
        `[RESPONSE] SLAMNAV dockResponse: ${errorToJson(error)}`,
      );
      throw error();
    }
  }

  @SubscribeMessage('lidarCloud')
  async handleLidarCloudMessage(@MessageBody() payload: any[]) {
    try {

      if(payload == null || payload == undefined || payload.length == 0){
        socketLogger.warn(`[STATUS] lidarCloud: NULL`);
        return;
      }

      if(isEqual(payload,this.lastLidarCloud)){
        // socketLogger.warn(`[STATUS] lidarCloud: Equal lastLidarCloud`);
        return;
      }
      this.lastLidarCloud = payload;

      this.server.to(['lidarCloud','all']).emit('lidarCloud', payload);

      if (this.frsSocket?.connected) {
        // this.frsSocket.emit('lidarCloud',msgpack.encode({robotSerial:global.robotSerial,data:payload}))
      }
    } catch (error) {
      socketLogger.error(`[STATUS] Lidar: ${errorToJson(error)}`);
      throw error();
    }
  }

  @SubscribeMessage('mappingCloud')
  async handleMappingCloudMessage(@MessageBody() payload: any[]) {
    try {
      if(payload == null || payload == undefined || payload.length == 0){
        socketLogger.warn(`[STATUS] mappingCloud: NULL`);
        return;
      }

      if(isEqual(payload,this.lastMappingCloud)){
        socketLogger.warn(`[STATUS] mappingCloud: Equal lastMappingCloud`);
        return;
      }
      this.lastMappingCloud = payload;

      this.server.to(['mappingCloud','all']).emit('mappingCloud', payload);
    } catch (error) {
      socketLogger.error(`[STATUS] Mapping Cloud: ${errorToJson(error)}`);
      throw error();
    }
  }

  @SubscribeMessage('localPath')
  async handleLocalPathdMessage(@MessageBody() payload: any[]) {
    try {
      if(payload == null || payload == undefined || payload.length == 0){
        socketLogger.warn(`[STATUS] localPath: NULL`);
        return;
      }

      if(isEqual(payload,this.lastLocalPath)){
        socketLogger.warn(`[STATUS] localPath: Equal localPath`);
        return;
      }
      this.lastLocalPath = payload;

      this.server.to(['localPath','all','path']).emit('localPath', payload);

      // if (this.frsSocket?.connected && global.robotSerial != '') {
      //   const sendData = {
      //     robotSerial: global.robotSerial,
      //     data: payload,
      //   };
      //   this.frsSocket.emit('localPath', sendData);
      // }

    } catch (error) {
      socketLogger.error(`[STATUS] localPath: ${errorToJson(error)}`);
      throw error();
    }
  }
  @SubscribeMessage('globalPath')
  async handleGlobalPathdMessage(@MessageBody() payload: any[]) {
    try {
      if(payload == null || payload == undefined || payload.length == 0){
        socketLogger.warn(`[STATUS] globalPath: NULL`);
        return;
      }

      if(isEqual(payload,this.lastGlobalPath)){
        // socketLogger.warn(`[STATUS] globalPath: Equal lastGlobalPath`);
        return;
      }
      this.lastGlobalPath = payload;

      this.server.to(['globalPath','all','path']).emit('globalPath', payload);
      // socketLogger.debug(`[STATUS] globalPath: ${JSON.stringify(payload)}`
    // );
      // if (this.frsSocket?.connected && global.robotSerial != '') {
      //   const sendData = {
      //     robotSerial: global.robotSerial,
      //     data: payload,
      //   };
      //   this.frsSocket.emit('globalPath', sendData);
      // }
    } catch (error) {
      socketLogger.error(`[STATUS] globalPath: ${errorToJson(error)}`);
      throw error();
    }
  }

  /**
   * @description 태스크 변수 초기화를 처리하는 함수
   * @param socket
   * @param payload 로봇 태스크 데이터
   */
  @SubscribeMessage('taskInit')
  async handleTaskInitMessage(
    @MessageBody() payload: { file: string; id: number; running: boolean },
  ) {
    try {
      this.taskState.file = payload.file;
      this.taskState.id = payload.id;
      this.taskState.running = payload.running;
      socketLogger.debug(`[INIT] Task Init: ${JSON.stringify(payload)}`);
      this.server.to(['taskInit','all','task']).emit('taskInit', this.taskState);
    } catch (error) {
      socketLogger.error(`[INIT] Task Init: ${errorToJson(error)}`);
      throw error();
    }
  }

  @SubscribeMessage('taskVariables')
  async handleTaskVariablesMessage(@MessageBody() payload: any[]) {
    try {
      this.taskState.variables = payload;
      socketLogger.debug(`[INIT] Task Variables: ${JSON.stringify(payload)}`);
      this.server.to(['taskVariables','all','task']).emit('taskVariables', payload);
    } catch (error) {
      socketLogger.error(`[INIT] Task Variables:  ${errorToJson(error)}`);
      throw error();
    }
  }

  @SubscribeMessage('taskDock')
  async handleTaskDockMessage() {
    try {
      socketLogger.debug(`[COMMAND] Task Dock`);
      this.slamnav?.emit('dock', {
        command: 'dock',
        time: Date.now().toString(),
      });
    } catch (error) {
      socketLogger.error(`[INIT] Task Dock:  ${errorToJson(error)}`);
      throw error();
    }
  }

  @SubscribeMessage('taskUndock')
  async handleTaskUnDockMessage() {
    try {
      socketLogger.debug(`[COMMAND] Task UnDock`);
      this.slamnav?.emit('dock', {
        command: 'undock',
        time: Date.now().toString(),
      });
    } catch (error) {
      socketLogger.error(`[INIT] Task UnDock:  ${errorToJson(error)}`);
      throw error();
    }
  }

  @SubscribeMessage('motion')
  async handleMotionMessage(@MessageBody() payload: string) {
    try {
      if(payload == null || payload == undefined){
        socketLogger.warn(`[COMMAND] motion: NULL`);
        return;
      }

      const json = JSON.parse(JSON.stringify(payload));
      this.slamnav?.emit('motion', json);
      socketLogger.debug(`[COMMAND] Motion: ${JSON.stringify(json)}`);
    } catch (error) {
      socketLogger.error(`[INIT] Motion:  ${errorToJson(error)}`);
      throw error();
    }
  }

  @SubscribeMessage('motionResponse')
  async handleMotionResponseMessage(@MessageBody() payload: string) {
    try {
      if(payload == null || payload == undefined){
        socketLogger.warn(`[RESPONSE] motionResponse: NULL`);
        return;
      }
      const json = JSON.parse(payload);
      this.server.to(['motionResponse','all','motion']).emit('motionResponse', json);

      if (this.frsSocket?.connected) {
        this.frsSocket.emit(
          'motionResponse',
          { robotSerial: global.robotSerial, data: json },
        );
      }

      if (this.tcpClient) {
        socketLogger.debug(`[CONNECT] Send TCP : ${json.result}`);
        this.tcpClient.write(json.result);
      }

      this.motionState = json;

      socketLogger.debug(`[RESPONSE] SLAMNAV Motion: ${JSON.stringify(json)}`);
    } catch (error) {
      socketLogger.error(`[RESPONSE] SLAMNAV Motion: ${errorToJson(error)}`);
      throw error();
    }
  }

  /**
   * @description 웹 변수 초기화를 처리하는 함수
   * @param socket
   */
  @SubscribeMessage('Webinit')
  async handleWebInitMessage() {
    try {
      const payload = {
        task: this.taskState,
        move: this.moveState,
        slam: this.robotState,
      };

      socketLogger.debug(`[INIT] Web Init : ${JSON.stringify(payload)}`);
      this.server.to(['Webinit','all']).emit('Webinit', payload);
    } catch (error) {
      socketLogger.error(`[INIT] Web Init: ${errorToJson(error)}`);
      throw error();
    }
  }

  //****************************************************** functions */
  getConnection() {
    // console.log(this.slamnav, this.taskman);
    return {
      SLAMNAV: this.slamnav ? true : false,
      TASK: this.taskman ? true : false,
    };
  }
}
