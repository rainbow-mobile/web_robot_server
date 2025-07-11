import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as ioClient from 'socket.io-client';
import { io } from 'socket.io-client';
import socketLogger from '@common/logger/socket.logger';
import { TaskPayload } from '@common/interface/robot/task.interface';
import { MovePayload } from '@common/interface/robot/move.interface';
import { StatusPayload } from '@common/interface/robot/status.interface';
import { stringifyAllValues } from '@common/util/network.util';
import { Global, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { errorToJson } from '@common/util/error.util';
import { NetworkService } from 'src/modules/apis/network/network.service';
import { instrument } from '@socket.io/admin-ui';
import * as net from 'net';
import {
  MotionCommand,
  MotionMethod,
} from 'src/modules/apis/motion/dto/motion.dto';
import { MotionPayload } from '@common/interface/robot/motion.interface';
import { SubscribeDto } from '@sockets/dto/subscribe.dto';
import {
  generateAmrDockingPrecisionLog,
  generateAmrMovingPrecisionLog,
  generateAmrObstacleLog,
  generateAmrVelocityLog,
  generateGeneralLog,
  generateManipulatorLog,
  generateTorsoLog,
  setAlarmGeneralLog,
} from '@common/logger/equipment.logger';
import {
  AmrLogType,
  FootOperationName,
  FormType,
  GeneralLogType,
  GeneralOperationName,
  GeneralOperationStatus,
  GeneralScope,
  GeneralStatus,
  ManipulatorType,
  VehicleOperationName,
} from '@common/enum/equipment.enum';
import { MoveStatusPayload } from '@interface/move/move.interface';
import { LogService } from 'src/modules/apis/log/log.service';
import { MessagePattern, RpcException } from '@nestjs/microservices';
import { AlarmDto } from '@sockets/dto/alarm.dto';
import { SequenceDto } from '@sockets/dto/sequence.dto';
import { MoveService } from 'src/modules/apis/move/move.service';
import { InjectRepository } from '@nestjs/typeorm';
import { MoveLogEntity } from 'src/modules/apis/move/entity/move.entity';
import { LessThan, Repository } from 'typeorm';
import { ExternalStatusPayload } from '@common/interface/robot/foot.interface';
import { FootCommand } from 'src/modules/apis/control/dto/external.control.dto';
import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const isEqual = (a: any, b: any) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

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
    OnGatewayInit,
    OnModuleInit
{
  constructor(
    private readonly networkService: NetworkService,
    private readonly logService: LogService,
    @InjectRepository(MoveLogEntity)
    private readonly moveRepository: Repository<MoveLogEntity>,
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
  externalAccessory: Socket;
  streaming: Socket;
  taskman: Socket;

  //samsung
  acs: Socket;
  manipulator: Socket;
  torso: Socket;

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

  lastData: Record<string, object | string> = {};

  //lastInputValue - SLAMNAV to RRS
  lastStatus: any;
  lastMoveStatus: any;
  lastLidarCloud: any;
  lastMappingCloud: any;
  lastLocalPath: any;
  lastGlobalPath: any;

  //lastInputValue - ExternalAccessory to RRS
  lastExternalStatus: ExternalStatusPayload;

  //lastInputValue - FRS to RRS
  lastFRSVobs: any;
  lastFRSVobsRobot: any;
  lastFRSVobsClosure: any;
  lastFRSPath: any;

  //Test Techtaka (lastGoalMove)
  lastGoal: string;
  intervalTime = 500 + Math.floor(Math.random() * 500);

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
                this.robotState.map?.map_name == ''
                  ? 'not loaded'
                  : this.robotState.map?.map_name;
              this.tcpClient.write(data);
            } else if (param == 'localization') {
              data = this.robotState.robot_state?.localization;
              this.tcpClient.write(data);
            } else if (param == 'charge') {
              data = this.robotState.robot_state?.charge;
              this.tcpClient.write(data);
            } else if (param == 'dock') {
              data = this.robotState.robot_state?.dock;
              this.tcpClient.write(data);
            } else if (param == 'auto_move') {
              data = this.robotState.move_state?.auto_move;
              this.tcpClient.write(data);
            } else if (param == 'path') {
              data = this.robotState.move_state?.path;
              this.tcpClient.write(data);
            } else if (param == 'obs') {
              data = this.robotState.move_state?.obs;
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
    this.debugMode = false; // onoff;
  }

  async connectFrsSocket(url: string) {
    try {
      if (global.robotSerial == undefined || global.robotSerial == '') {
        socketLogger.warn(`[CONNECT] FRS Socket pass : robotSerial missing`);
        return;
      }

      if (this.frsSocket?.connected) {
        this.frsSocket?.disconnect();
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
          robotSerial: global.robotSerial,
        };

        // const newData = { command: 'resume', time: Date.now().toString() };
        // socketLogger.info(`[TEST] Frs connected and Move Resume`);
        // this.slamnav?.emit('move', stringifyAllValues(newData));

        socketLogger.debug(`[CONNECT] FRS init : ${JSON.stringify(sendData)}`);
        this.frsSocket.emit('init', sendData);
      });

      this.frsSocket.on('disconnect', (data) => {
        socketLogger.error(
          `[CONNECT] FRS Socket disconnected: ${errorToJson(data)}`,
        );
        global.frsConnect = false;

        //Test Techtaka (pause)
        this.lastGoal = this.lastMoveStatus?.goal_node?.id;
        const newData = { command: 'pause', time: Date.now().toString() };
        socketLogger.info(`[TEST] Frs disconnected and Move Pause`);
        this.slamnav?.emit('move', stringifyAllValues(newData));
      });

      this.frsSocket.on('error', (error) => {
        socketLogger.error(`[CONNECT] FRS Socket error: ${errorToJson(error)}`);
      });

      this.frsSocket.on('init', (_data) => {
        try {
          if (_data == null || _data == undefined) {
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

          //Test Techtaka (resume)
          const newData = {
            command: 'resume',
            time: Date.now().toString(),
          };
          // this.slamnav?.emit('move', stringifyAllValues(newData));
          // socketLogger.info(`[TEST] Frs connected and Resume`);
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
          if (_data == null || _data == undefined) {
            socketLogger.warn(`[COMMAND] FRS Move : NULL`);
            return;
          } else {
            const data = _data;
            const json = JSON.parse(data);

            if (
              json.command == null ||
              json.command == undefined ||
              json.command == ''
            ) {
              socketLogger.warn(`[COMMAND] FRS Move : Command NULL`);
              return;
            }

            this.saveLog({
              command: json.command,
              goal_id: json.goal_id,
              goal_name: json.goal_name ?? null,
              map_name: json.map_name ?? null,
              x: json.x ? parseFloat(json.x) : null,
              y: json.x ? parseFloat(json.y) : null,
              rz: json.rz ? parseFloat(json.rz) : null,
            });

            socketLogger.info(
              `[COMMAND] FRS Move2       : ${JSON.stringify(json)}`,
            );
            if (this.slamnav) {
              this.slamnav?.emit('move', stringifyAllValues(json));
            } else {
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
        } catch (error) {
          socketLogger.error(
            `[COMMAND] FRS Move      : ${JSON.stringify(_data)}, ${errorToJson(error)}`,
          );
        }
      });

      this.frsSocket.on('load', (_data) => {
        try {
          if (_data == null || _data == undefined) {
            socketLogger.warn(`[COMMAND] FRS load : NULL`);
            return;
          }
          const data = _data;
          const json = JSON.parse(data);

          if (
            json.command == null ||
            json.command == undefined ||
            json.command == ''
          ) {
            socketLogger.warn(`[COMMAND] FRS load : Command NULL`);
            return;
          }

          socketLogger.debug(`[COMMAND] FRS Load: ${JSON.stringify(json)}`);
          if (this.slamnav) {
            this.slamnav.emit('load', stringifyAllValues(json));
          } else {
            this.frsSocket.emit('loadResponse', {
              robotSerial: global.robotSerial,
              data: {
                ...data,
                result: 'fail',
                message: 'SLAMNAV2 disconnected',
              },
            });
          }
        } catch (error) {
          socketLogger.error(
            `[COMMAND] FRS MapLoad: ${JSON.stringify(_data)}, ${errorToJson(error)}`,
          );
        }
      });

      this.frsSocket.on('motor', (_data) => {
        try {
          if (_data == null || _data == undefined) {
            socketLogger.warn(`[COMMAND] FRS motor : NULL`);
            return;
          }
          const data = _data;
          const json = JSON.parse(data);

          if (
            json.command == null ||
            json.command == undefined ||
            json.command == ''
          ) {
            socketLogger.warn(`[COMMAND] FRS motor : Command NULL`);
            return;
          }
          socketLogger.debug(`[COMMAND] FRS motor: ${JSON.stringify(json)}`);
          if (this.slamnav) {
            this.slamnav.emit('motor', stringifyAllValues(json));
          } else {
            this.frsSocket.emit('motorResponse', {
              robotSerial: global.robotSerial,
              data: {
                ...data,
                result: 'fail',
                message: 'SLAMNAV2 disconnected',
              },
            });
          }
        } catch (error) {
          socketLogger.error(
            `[COMMAND] FRS motor: ${JSON.stringify(_data)}, ${errorToJson(error)}`,
          );
        }
      });

      this.frsSocket.on('localization', (_data) => {
        try {
          if (_data == null || _data == undefined) {
            socketLogger.warn(`[COMMAND] FRS localization : NULL`);
            return;
          }
          const data = _data;
          const json = JSON.parse(data);

          if (
            json.command == null ||
            json.command == undefined ||
            json.command == ''
          ) {
            socketLogger.warn(`[COMMAND] FRS localization : Command NULL`);
            return;
          }
          socketLogger.debug(
            `[COMMAND] FRS Localization: ${JSON.stringify(json)}`,
          );
          if (this.slamnav) {
            this.slamnav.emit('localization', stringifyAllValues(json));
          } else {
            this.frsSocket.emit('localizationResponse', {
              robotSerial: global.robotSerial,
              data: {
                ...data,
                result: 'fail',
                message: 'SLAMNAV2 disconnected',
              },
            });
          }
        } catch (error) {
          socketLogger.error(
            `[COMMAND] FRS Localization: ${JSON.stringify(_data)}, ${errorToJson(error)}`,
          );
        }
      });

      this.frsSocket.on('randomseq', (_data) => {
        try {
          if (_data == null || _data == undefined) {
            socketLogger.warn(`[COMMAND] FRS randomseq : NULL`);
            return;
          }
          const data = _data;
          const json = JSON.parse(data);

          if (
            json.command == null ||
            json.command == undefined ||
            json.command == ''
          ) {
            socketLogger.warn(`[COMMAND] FRS randomseq : Command NULL`);
            return;
          }
          socketLogger.debug(
            `[COMMAND] FRS randomseq: ${JSON.stringify(json)}`,
          );
          if (this.slamnav) {
            this.slamnav.emit('randomseq', stringifyAllValues(json));
          } else {
            this.frsSocket.emit('randomseqResponse', {
              robotSerial: global.robotSerial,
              data: {
                ...data,
                result: 'fail',
                message: 'SLAMNAV2 disconnected',
              },
            });
          }
        } catch (error) {
          socketLogger.error(
            `[COMMAND] FRS randomseq: ${JSON.stringify(_data)}, ${errorToJson(error)}`,
          );
        }
      });

      this.frsSocket.on('mapping', (_data) => {
        try {
          if (_data == null || _data == undefined) {
            socketLogger.warn(`[COMMAND] FRS mapping : NULL`);
            return;
          }
          const data = _data;
          const json = JSON.parse(data);

          if (
            json.command == null ||
            json.command == undefined ||
            json.command == ''
          ) {
            socketLogger.warn(`[COMMAND] FRS mapping : Command NULL`);
            return;
          }
          socketLogger.debug(`[COMMAND] FRS mapping: ${JSON.stringify(json)}`);
          if (this.slamnav) {
            this.slamnav.emit('mapping', stringifyAllValues(json));
          } else {
            this.frsSocket.emit('mappingResponse', {
              robotSerial: global.robotSerial,
              data: {
                ...data,
                result: 'fail',
                message: 'SLAMNAV2 disconnected',
              },
            });
          }
        } catch (error) {
          socketLogger.error(
            `[COMMAND] FRS mapping: ${JSON.stringify(_data)}, ${errorToJson(error)}`,
          );
        }
      });

      this.frsSocket.on('dock', (_data) => {
        try {
          if (_data == null || _data == undefined) {
            socketLogger.warn(`[COMMAND] FRS dock : NULL`);
            return;
          }
          const data = _data;
          const json = JSON.parse(data);

          socketLogger.debug(`[COMMAND] FRS dock: ${JSON.stringify(json)}`);
          if (this.slamnav) {
            this.slamnav.emit('dock', stringifyAllValues(json));
          } else {
            this.frsSocket.emit('dockResponse', {
              robotSerial: global.robotSerial,
              data: {
                ...data,
                result: 'fail',
                message: 'SLAMNAV2 disconnected',
              },
            });
          }
        } catch (error) {
          socketLogger.error(
            `[COMMAND] FRS dock: ${JSON.stringify(_data)}, ${errorToJson(error)}`,
          );
        }
      });

      this.frsSocket.on('lidarOnOff', (_data) => {
        try {
          if (_data == null || _data == undefined) {
            socketLogger.warn(`[COMMAND] FRS lidarOnOff : NULL`);
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
          if (_data == null || _data == undefined) {
            socketLogger.warn(`[COMMAND] FRS led : NULL`);
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
          if (_data == null || _data == undefined) {
            socketLogger.warn(`[COMMAND] FRS pathOnOff : NULL`);
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
          if (_data == null || _data == undefined) {
            socketLogger.warn(`[COMMAND] FRS path : NULL`);
            return;
          }
          const data = _data;
          const json = JSON.parse(data);

          if (isEqual(json, this.lastFRSPath)) {
            socketLogger.warn(`[COMMAND] FRS path : Equal lastFRSPath`);
            return;
          }
          this.lastFRSPath = json;
          socketLogger.debug(`[COMMAND] FRS path: ${JSON.stringify(json)}`);
          this.slamnav?.emit('path', stringifyAllValues(json));
          // this.frsSocket?.emit('pathResponse', stringifyAllValues(json));
        } catch (error) {
          console.error(error);
          socketLogger.error(
            `[COMMAND] FRS path: ${JSON.stringify(_data)}, ${errorToJson(error)}`,
          );
        }
      });

      this.frsSocket.on('vobs', (_data) => {
        try {
          if (_data == null || _data == undefined) {
            socketLogger.warn(`[COMMAND] FRS vobs : NULL`);
            return;
          }
          const data = _data;
          const json = JSON.parse(data);
          if (isEqual(json, this.lastFRSVobs)) {
            socketLogger.warn(`[COMMAND] FRS vobs : Equal lastFRSvobs`);
            return;
          }
          this.lastFRSVobs = json;
          socketLogger.debug(`[COMMAND] FRS vobs: ${JSON.stringify(json)}`);
          this.slamnav?.emit('vobs', stringifyAllValues(json));
        } catch (error) {
          socketLogger.error(
            `[COMMAND] FRS vobs: ${JSON.stringify(_data)}, ${errorToJson(error)}`,
          );
        }
      });

      this.frsSocket.on('vobsRobots', (_data) => {
        try {
          if (_data == null || _data == undefined) {
            socketLogger.warn(`[COMMAND] FRS vobsRobots : NULL`);
            return;
          }
          const data = _data;
          const json = JSON.parse(data);
          if (isEqual(json, this.lastFRSVobsRobot)) {
            socketLogger.warn(
              `[COMMAND] FRS vobsRobots : Equal lastFRSVobsRobot`,
            );
            return;
          }
          this.lastFRSVobsRobot = json;
          socketLogger.debug(
            `[COMMAND] FRS vobsRobots: ${JSON.stringify(json)}`,
          );
          this.slamnav?.emit('vobsRobots', stringifyAllValues(json));
        } catch (error) {
          socketLogger.error(
            `[COMMAND] FRS vobsRobots: ${JSON.stringify(_data)}, ${errorToJson(error)}`,
          );
        }
      });

      this.frsSocket.on('vobsClosures', (_data) => {
        try {
          if (_data == null || _data == undefined) {
            socketLogger.warn(`[COMMAND] FRS vobsClosures : NULL`);
            return;
          }
          const data = _data;
          const json = JSON.parse(data);

          if (isEqual(json, this.lastFRSVobsClosure)) {
            socketLogger.warn(
              `[COMMAND] FRS vobsClosures : Equal lastFRSVobsClosure`,
            );
            return;
          }
          this.lastFRSVobsClosure = json;
          socketLogger.debug(
            `[COMMAND] FRS vobsClosures: ${JSON.stringify(json)}`,
          );
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

    this.server
      .to(['programStatus', 'all', 'allStatus'])
      .emit('programStatus', statusData.data);

    if (this.frsSocket?.connected && global.robotSerial != '') {
      this.frsSocket.emit('programStatus', statusData);
    }

    //interval changed (25-05-07 for traffic test)
  }, this.intervalTime);

  onModuleInit() {
    this.setConnectChecker();
  }

  onModuleDestroy() {
    generateGeneralLog({
      logType: GeneralLogType.MANUAL,
      status: GeneralStatus.STOP,
      scope: GeneralScope.EVENT,
      operationName: GeneralOperationName.PROGRAM_END,
      operationStatus: GeneralOperationStatus.SET,
    });

    socketLogger.warn(`[CONNECT] Socket Gateway Destroy`);
    this.frsSocket?.disconnect();
    clearInterval(this.interval_frs);
  }

  private connectChecker: NodeJS.Timeout;
  setConnectChecker() {
    this.connectChecker = setTimeout(() => {
      if (!this.slamnav) {
        socketLogger.error(`[CHECKER] connect Checker : Slamnav not connected`);
        this.startAlarmCode(2000);
      } else {
        socketLogger.debug(`[CHECKER] connect Checker : Slamnav connected`);
      }

      if (!this.externalAccessory) {
        socketLogger.error(
          `[CHECKER] connect Checker : ExternalAccessory not connected`,
        );
      } else {
        socketLogger.debug(
          `[CHECKER] connect Checker : ExternalAccessory connected`,
        );
      }

      if (!this.acs) {
        socketLogger.error(`[CHECKER] connect Checker : acs not connected`);
        // this.setAlarmCode(2016);
      } else {
        socketLogger.debug(`[CHECKER] connect Checker : acs connected`);
      }
    }, 10000);
  }
  onApplicationShutdown(signal?: string): any {
    socketLogger.warn(`[CONNECT] Socket Gateway Shutdown Signal ${signal}`);
    this.frsSocket?.disconnect();
    clearInterval(this.interval_frs);
  }

  // 클라이언트가 연결되면 룸에 join 시킬 수 있음
  handleConnection(client: Socket) {
    socketLogger.info(
      `[CONNECT] New Client: Name(${client.handshake.query.name}), IP(${client.handshake.address}), ID(${client.id})`,
    );
    if (client.handshake.query.name == 'slamnav') {
      if (this.slamnav) {
        socketLogger.warn(`[CONNET] Slamnav already connected -> ignored `);
      } else {
        this.slamnav = client;
        socketLogger.info(`[CONNECT] Slamnav connected`);
        this.frsSocket?.emit('slamRegist');
        clearTimeout(this.connectChecker);
        this.clearAlarmCode(2000);
      }
    } else if (client.handshake.query.name == 'externalAccessory') {
      if (this.externalAccessory) {
        socketLogger.warn(
          `[CONNET] externalAccessory already connected -> ignored `,
        );
      } else {
        this.externalAccessory = client;
        clearTimeout(this.connectChecker);
      }
    } else if (client.handshake.query.name == 'taskman') {
      this.taskman = client;
      this.taskState.connection = true;
      // this.taskman.emit('file')
    } else if (client.handshake.query.name == 'streaming') {
      this.streaming = client;
    } else if (client.handshake.query.name == 'manipulator') {
      this.manipulator = client;
    } else if (client.handshake.query.name == 'torso') {
      this.torso = client;
    } else if (client.handshake.query.name == 'acs') {
      this.acs = client;
      this.clearAlarmCode(2000);
    }
    client.join(client.handshake.query.name);
  }

  // 클라이언트가 연결 해제되면 룸에서 leave 시킬 수 있음
  handleDisconnect(client: Socket) {
    socketLogger.info(
      `[CONNECT] Client disconnected: Name(${client.handshake.query.name}), IP(${client.handshake.address}), ID(${client.id})`,
    );

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
            socketLogger.debug(`[CONNECT] Send TCP : disconnected`);
            this.tcpClient.write('disconnected');
          }

          this.frsSocket?.emit('slamUnregist');
          this.slamnav = null;
          this.setConnectChecker();
          // slamnav 연결 해제 시 알람 상태 초기화
          this.clearAllAlarmStates();

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
            this.server
              .to(['taskStop', 'all', 'task'])
              .emit('taskStop', 'disconnected');
          }
        } else {
          socketLogger.warn(
            `[CONNECT] Slamnav disconnected -> another one. ignored`,
          );
        }
      }
    } else if (client.handshake.query.name == 'externalAccessory') {
      if (this.externalAccessory) {
        if (this.externalAccessory.id === client.id) {
          this.externalAccessory = null;
          this.setConnectChecker();
        } else {
          socketLogger.warn(
            `[CONNECT] externalAccessory disconnected -> another one. ignored`,
          );
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
    } else if (client.handshake.query.name == 'manipulator') {
      this.manipulator = null;
    } else if (client.handshake.query.name == 'torso') {
      this.torso = null;
    }

    client.leave(client.handshake.query.name as string);
  }

  // 클라이언트가 해당 토픽 구독
  @SubscribeMessage('subscribe')
  async handelSubscribe(
    @MessageBody() dto: SubscribeDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      socketLogger.info(`[SUB] Client Subscribe ${client.id}, ${dto.topic}`);

      if (client.rooms.has(dto.topic)) {
        client.join(dto.topic);
        socketLogger.warn(
          `[SUB] Client Subscribe ${client.id} already in room ${dto.topic}`,
        );
        return 'already in room';
      } else {
        client.join(dto.topic);
        return 'success';
      }
    } catch (error) {
      socketLogger.error(
        `[SUB] Client Subscribe ${client.id}, ${dto.topic} -> ${errorToJson(error)}`,
      );
    }
  }

  // 클라이언트가 해당 토픽 구독해제
  @SubscribeMessage('unsubscribe')
  async handelUnsubscribe(
    @MessageBody() dto: SubscribeDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (dto.topic == 'all') {
        socketLogger.info(
          `[SUB] Client Unsubscribe ${client.id} all : rooms size is ${client.rooms.size - 1}`,
        );
        for (const room of client.rooms) {
          // client.id는 고유한 기본 room이므로 제외
          if (room !== client.id) {
            client.leave(room);
          }
        }
        return 'success';
      } else {
        if (!client.rooms.has(dto.topic)) {
          client.leave(dto.topic);
          socketLogger.warn(
            `[SUB] Client Unsubscribe ${client.id} not in room ${dto.topic}`,
          );
          return 'not in room';
        } else {
          client.leave(dto.topic);
          socketLogger.info(
            `[SUB] Client Unsubscribe ${client.id}, ${dto.topic}`,
          );
          return 'success';
        }
      }
    } catch (error) {
      socketLogger.error(
        `[SUB] Client Unsubscribe ${client.id}, ${dto.topic} -> ${errorToJson(error)}`,
      );
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
      this.server.to(['taskStart', 'all', 'task']).emit('taskStart', payload);
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
      this.server.to(['taskDone', 'all', 'task']).emit('taskDone', payload);
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
      this.server.to(['taskLoad', 'all', 'task']).emit('taskLoad', payload);
    } catch (error) {
      socketLogger.error(`[RESPONSE] Task Load: ${errorToJson(error)}`);
    }
  }

  async saveLog(data: {
    command: string;
    goal_id?: string;
    goal_name?: string;
    map_name?: string;
    x?: number;
    y?: number;
    rz?: number;
  }) {
    if (
      data.command === 'stop' ||
      data.command === 'goal' ||
      data.command === 'target' ||
      data.command === 'pause' ||
      data.command === 'resume'
    ) {
      socketLogger.info(`[MOVE] saveLog : ${JSON.stringify(data)}`);
      //save Log--------------------------------
      this.moveRepository.save(data);

      //일주일 지난 기록 삭제
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      await this.moveRepository.delete({
        time: LessThan(oneWeekAgo),
      });

      // 30개 초과 시 가장 오래된 거 삭제
      // const count = await this.moveRepository.count();
      // console.log('count : ', count);
      // if (count >= 30) {
      //   const oldest = await this.moveRepository.find({
      //     order: { time: 'ASC' }, // createdAt이 있다면
      //     take: count - 29,
      //   });
      //   await this.moveRepository.remove(oldest);
      // }

      //save Log--------------------------------
    } else {
      socketLogger.debug(`[ERROR] what?`);
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
      this.server.to(['taskError', 'all', 'task']).emit('taskError', payload);
    } catch (error) {
      socketLogger.error(`[RESPONSE] Task Error: ${errorToJson(error)}`);
      throw error;
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
      this.server.to(['taskId', 'all', 'task']).emit('taskId', payload);
    } catch (error) {
      socketLogger.error(`[RESPONSE] Task Id Change: ${errorToJson(error)}`);
      throw error;
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
      if (payload == null || payload == undefined) {
        socketLogger.warn(`[COMMAND] Move: NULL`);
        return;
      }

      const json = JSON.parse(JSON.stringify(payload));
      this.saveLog({
        command: json.command,
        goal_id: json.goal_id,
        goal_name: json.goal_name ?? null,
        map_name: json.map_name ?? null,
        x: json.x ? parseFloat(json.x) : null,
        y: json.x ? parseFloat(json.y) : null,
        rz: json.rz ? parseFloat(json.rz) : null,
      });

      socketLogger.debug(`[COMMAND] Move: ${JSON.stringify(json)}`);
      this.slamnav?.emit('move', stringifyAllValues(json));
    } catch (error) {
      socketLogger.error(`[COMMAND] Move: ${errorToJson(error)}`);
      throw error;
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
      if (payload == null || payload == undefined) {
        socketLogger.warn(`[COMMAND] Move: NULL`);
        return;
      }

      const json = JSON.parse(JSON.stringify(payload));
      this.saveLog({
        command: json.command,
        goal_id: json.goal_id,
        goal_name: json.goal_name ?? null,
        map_name: json.map_name ?? null,
        x: json.x ? parseFloat(json.x) : null,
        y: json.x ? parseFloat(json.y) : null,
        rz: json.rz ? parseFloat(json.rz) : null,
      });
      // if(isEqual(json,this.lastMoveRequest)){
      //   socketLogger.warn(`[COMMAND] Move: Equal lastMoveRequest`);
      //   return;
      // }
      // this.lastMoveRequest = json;

      socketLogger.debug(`[COMMAND] Move: ${JSON.stringify(json)}`);
      this.slamnav?.emit('move', stringifyAllValues(json));
    } catch (error) {
      socketLogger.error(`[COMMAND] Move: ${errorToJson(error)}`);
      throw error;
    }
  }

  @SubscribeMessage('footStatus')
  async handleFootSTatusMessage(
    @MessageBody() payload: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (client.id == this.externalAccessory?.id) {
        if (payload == null || payload == undefined) {
          socketLogger.warn(`[STATUS] footStatus: NULL`);
          return;
        }

        const jsontemp = JSON.parse(payload);
        let json = jsontemp;
        try {
          json = {
            foot: {
              connection: jsontemp.foot.connection === 'true' ? true : false,
              foot_state: parseInt(jsontemp.foot.foot_state),
              is_down: jsontemp.foot.is_down === 'true' ? true : false,
              position: parseFloat(jsontemp.foot.position),
            },
            time: jsontemp.time,
          };
        } catch (error) {
          console.error(error);
          json = jsontemp;
        }
        // console.log('footStatus : ', json);
        const tempjson = { ...json };
        delete tempjson.time;
        if (isEqual(tempjson, this.lastExternalStatus)) {
          return;
        }

        this.lastExternalStatus = tempjson;
        this.server
          .to(['footStatus', 'all', 'allStatus'])
          .emit('footStatus', json);

        if (this.slamnav) {
          this.slamnav.emit('footStatus', stringifyAllValues(json));
        } else {
          // console.log("??????????");
        }

        if (this.frsSocket?.connected) {
          this.frsSocket.emit('footStatus', {
            robotSerial: global.robotSerial,
            data: json,
          });
        }
      } else {
        socketLogger.warn(
          `[STATUS] another externalAccessory footStatus ${this.externalAccessory?.id}, ${client.id}`,
        );
      }
    } catch (error) {
      socketLogger.error(`[STATUS] footStatus : ${errorToJson(error)}`);
    }
  }

  parseStatus(status: any): any {
    try {
      /// 1) battey만 특별하게 파싱
      if (status.power) {
        if (status.power.tabos_status) {
          status.power.tabos_status = this.parseTabosStatus(
            parseInt(status.power.tabos_status),
          );
        }
      }
      return status;
    } catch (error) {
      console.error(error);
      return status;
    }
  }

  parseTabosStatus(status: number): any {
    const tabos_status_error: {
      error_over_voltage: boolean;
      error_low_voltage: boolean;
      error_high_charge_current: boolean;
      error_high_discharge_current: boolean;
      error_high_temperature: boolean;
      error_low_temperature: boolean;
      error_bmu: boolean;
    } = {
      error_over_voltage: false,
      error_low_voltage: false,
      error_high_charge_current: false,
      error_high_discharge_current: false,
      error_high_temperature: false,
      error_low_temperature: false,
      error_bmu: false,
    };

    const bits = this.getBits(status, 16);
    if (bits[0] === 1) {
      tabos_status_error.error_over_voltage = true;
    }
    if (bits[1] === 1) {
      tabos_status_error.error_low_voltage = true;
    }
    if (bits[2] === 1) {
      tabos_status_error.error_high_charge_current = true;
    }
    if (bits[3] === 1) {
      tabos_status_error.error_high_discharge_current = true;
    }
    if (bits[4] === 1) {
      tabos_status_error.error_high_temperature = true;
    }
    if (bits[5] === 1) {
      tabos_status_error.error_low_temperature = true;
    }
    if (bits[6] === 1) {
      tabos_status_error.error_bmu = true;
    }
    return tabos_status_error;
  }

  getBits(value: number, bitLength = 8): number[] {
    return value
      .toString(2) // 2진수 문자열로 변환
      .padStart(bitLength, '0') // 앞을 0으로 채워서 bitLength 맞춤
      .split('') // 문자 하나씩 분리
      .map((bit) => parseInt(bit)) // 숫자로 변환
      .reverse();
  }

  @SubscribeMessage('status')
  async handleStatusMessage(
    @MessageBody() payload: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (client.id == this.slamnav?.id) {
        if (payload == null || payload == undefined || payload == '') {
          socketLogger.warn(`[STATUS] Status: NULL`);
          return;
        }

        const json = this.parseStatus(JSON.parse(payload));
        // console.log(json);
        // socketLogger.debug(`status in : ${JSON.stringify(json)}`);
        const tempjson = { ...json };
        delete tempjson.time;
        if (isEqual(tempjson, this.lastStatus)) {
          return;
        }

        //samsung - 맵 상태 변경 시 알람 처리
        if (this.lastStatus?.map?.map_name !== tempjson.map?.map_name) {
          if (tempjson.map.map_name !== '') {
            // 맵이 로드된 경우 관련 알람 해제
            this.clearAlarmCode(2002);
            this.clearAlarmCode(2003);
            this.clearAlarmCode(2004);
          } else {
            // 맵이 없는 경우 알람 발생
            this.startAlarmCode(2003);
          }
        }

        // 로컬라이제이션 상태 변경 시 알람 처리
        if (
          this.lastStatus?.robot_state?.localization !==
          tempjson.robot_state?.localization
        ) {
          if (tempjson.robot_state.localization === 'good') {
            // 로컬라이제이션 정상 시 알람 해제
            this.clearAlarmCode(2001);
          } else {
            // 로컬라이제이션 실패 시 알람 발생
            this.startAlarmCode(2001);
          }
        }

        // EMO 상태 변경 시 알람 처리
        if (this.lastStatus?.robot_state?.emo !== tempjson.robot_state?.emo) {
          if (tempjson.robot_state.emo === 'false') {
            // EMO 비활성화 시 알람 해제
            this.clearAlarmCode(3000);
          } else {
            // EMO 활성화 시 알람 발생
            this.startAlarmCode(3000);
          }
        }

        // 배터리 상태 변경 시 알람 처리 개선
        if (
          this.lastStatus?.power?.bat_out !== tempjson.power?.bat_out ||
          this.lastStatus?.power?.bat_percent !== tempjson.power?.bat_percent
        ) {
          const batOut = parseFloat(tempjson.power.bat_out);
          const batPercent = parseFloat(tempjson.power.bat_percent);

          // 배터리 전압 낮음 (4000)
          if (batOut < 43.4) {
            this.startAlarmCode(4000);
            this.clearAlarmCode(4002);
            this.clearAlarmCode(4003);
          }
          // 배터리 잔량 5% 미만 (4003)
          else if (batPercent < 5) {
            this.clearAlarmCode(4000);
            this.startAlarmCode(4003);
            this.clearAlarmCode(4002);
          }
          // 배터리 잔량 15% 미만 (4002)
          else if (batPercent < 15) {
            this.clearAlarmCode(4000);
            this.clearAlarmCode(4003);
            this.startAlarmCode(4002);
          }
          // 정상 상태 - 모든 배터리 알람 해제
          else {
            this.clearAlarmCode(4000);
            this.clearAlarmCode(4002);
            this.clearAlarmCode(4003);
          }
        }

        // if (this.lastStatus?.motor[0].current !== tempjson.motor[0].current) {
        //   if (
        //     parseFloat(tempjson.motor[0].current) > 20 ||
        //     parseFloat(tempjson.motor[1].current) > 20
        //   ) {
        //     this.setAlarmCode(4500);
        //   } else {
        //     this.clearAlarmCode(4500);
        //   }
        // }

        // if (this.lastStatus?.motor[0].temp !== tempjson.motor[0].temp) {
        //   if (
        //     parseFloat(tempjson.motor[0].temp) > 60 ||
        //     parseFloat(tempjson.motor[1].temp) > 60
        //   ) {
        //     this.setAlarmCode(4505);
        //   } else {
        //     this.clearAlarmCode(4505);
        //   }
        // }

        // if (this.lastStatus?.motor[0].status !== tempjson.motor[0].status) {
        //   if (tempjson.motor[0].status === '1') {
        //     this.clearAlarmCode(4515);
        //   } else {
        //     this.setAlarmCode(4515);
        //   }
        // }

        // if (this.lastStatus?.motor[1].status !== tempjson.motor[1].status) {
        //   if (tempjson.motor[1].status === '1') {
        //     this.clearAlarmCode(4514);
        //   } else {
        //     this.setAlarmCode(4514);
        //   }
        // }

        // if (
        //   this.lastStatus?.motor[0].connection !==
        //     tempjson.motor[0].connection ||
        //   this.lastStatus?.motor[1].connection !== tempjson.motor[1].connection
        // ) {
        //   if (
        //     tempjson.motor[0].connection === 'true' &&
        //     tempjson.motor[1].connection === 'false'
        //   ) {
        //     this.clearAlarmCode(4517);
        //   } else {
        //     this.setAlarmCode(4517);
        //   }
        // }

        // if (
        //   this.lastStatus?.lidar[0].connection !== tempjson.lidar[0].connection
        // ) {
        //   if (tempjson.lidar[0].connection === '1') {
        //     this.clearAlarmCode(5100);
        //   } else {
        //     this.setAlarmCode(5100);
        //   }
        // }

        // if (
        //   this.lastStatus?.lidar[1].connection !== tempjson.lidar[1].connection
        // ) {
        //   if (tempjson.lidar[1].connection === '1') {
        //     this.clearAlarmCode(5101);
        //   } else {
        //     this.setAlarmCode(5101);
        //   }
        // }

        this.lastStatus = tempjson;

        this.server.to(['status', 'all', 'allStatus']).emit('status', json);
        this.externalAccessory?.emit('status', payload);

        if (this.frsSocket?.connected) {
          this.frsSocket.emit('status', {
            robotSerial: global.robotSerial,
            data: json,
          });
        }

        this.robotState = { ...this.robotState, ...json };
      } else {
        socketLogger.warn(
          `[STATUS] another slamnav status ${this.slamnav?.id}, ${client.id}`,
        );
      }
    } catch (error) {
      socketLogger.error(`[STATUS] status : ${errorToJson(error)}`);
    }
  }

  @SubscribeMessage('system_status')
  async handleSystemStatusMessage(
    @MessageBody() payload: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (client.id == this.slamnav?.id) {
        if (payload == null || payload == undefined) {
          socketLogger.warn(`[STATUS] System Status: NULL`);
          return;
        }

        const json = JSON.parse(payload);
        const compareJson = { ...json };

        // time을 제거하지 않으면 어차피 밑에서 비교했을때 이전 값과 무조건 다름!!
        delete compareJson.time;

        // isEqual 대신 JSON.stringify 사용하여 CPU 사용량 줄임
        if (
          JSON.stringify(compareJson) ===
          JSON.stringify(this.lastData['system_status'])
        ) {
          return;
        }

        // 이전 값을 하나의 객체에 키값으로 여러 값들을 관리 가능!
        this.lastData['system_status'] = compareJson;

        this.server
          .to(['system_status', 'all', 'allStatus'])
          .emit('system_status', json);

        if (this.frsSocket?.connected) {
          this.frsSocket.emit('system_status', {
            robotSerial: global.robotSerial,
            data: json,
          });
        }
      } else {
        socketLogger.warn(
          `[STATUS] another slamnav system status ${this.slamnav?.id}, ${client.id}`,
        );
      }
    } catch (error) {
      socketLogger.error(`[STATUS] system status : ${errorToJson(error)}`);
    }
  }

  @SubscribeMessage('moveStatus')
  async handleWorkingStatusMessage(
    @MessageBody() payload: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (client.id == this.slamnav?.id) {
        if (payload == null || payload == undefined) {
          socketLogger.warn(`[STATUS] MoveStatus: NULL`);
          return;
        }

        const json = JSON.parse(payload);
        // socketLogger.debug(`[STATUS] moveStatus in : ${JSON.stringify(json)}`);
        // delete json.time;
        if (isEqual(json, this.lastMoveStatus)) {
          // socketLogger.warn(`[STATUS] MoveStatus: Equal`)
          return;
        }

        this.lastMoveStatus = json;

        this.server
          .to(['moveStatus', 'all', 'allStatus'])
          .emit('moveStatus', json);
        this.externalAccessory?.emit('moveStatus', payload);

        // socketLogger.debug(`[STATUS] MoveStatus : ${json.time}`)
        if (this.frsSocket?.connected) {
          this.frsSocket.emit('moveStatus', {
            robotSerial: global.robotSerial,
            data: json,
          });
        }

        // this.influxService.writeMoveStatus(json);
        this.robotState = { ...this.robotState, ...json };
      }
    } catch (error) {
      socketLogger.error(`[STATUS] MoveStatus : ${errorToJson(error)}`);

      // generateGeneralLog({
      //   logType: GeneralLogType.AUTO,
      //   status: GeneralStatus.ERROR,
      //   scope: GeneralScope.VEHICLE,
      //   operationName: GeneralOperationName.MOVE,
      //   operationStatus: GeneralOperationStatus.SET,
      //   data: `[STATUS] MoveStatus : ${errorToJson(error)}`,
      // });
    }
  }

  /**
   * @description SLAMNAV의 이동 응답 메시지를 처리하는 함수
   * @param socket
   * @param payload 로봇 이동 변수
   */
  @SubscribeMessage('moveResponse')
  async handleMoveReponseMessage(
    @MessageBody() payload: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (client.id == this.slamnav?.id) {
        console.log('moveResponse : ', JSON.parse(payload));
        if (payload == null || payload == undefined) {
          this.setAlarmLog(10002);
          socketLogger.warn(`[RESPONSE] moveResponse: NULL`);
          return;
        }

        const json = JSON.parse(payload);

        if (
          json.command == null ||
          json.command == undefined ||
          json.command == ''
        ) {
          this.setAlarmLog(10002);
          socketLogger.warn(`[RESPONSE] moveResponse: Command NULL`);
          return;
        }

        //samsung
        if (json.result === 'fail') {
          if (json.message === 'path out') {
            this.setAlarmCode(2005);
          } else if (json.message === 'localization fail') {
            this.setAlarmCode(2006);
          } else if (json.message === 'path not found') {
            this.setAlarmCode(2018);
          } else if (json.message === 'somthing wrong') {
          } else if (json.message === 'not ready') {
            this.setAlarmCode(2019);
          } else if (json.message === 'manual stopped') {
          } else if (json.message === 'bumper crash') {
            this.setAlarmCode(3001);
          } else {
          }
        } else if (json.result === 'reject') {
          if (json.message === 'map not loaded') {
            this.setAlarmCode(2003);
          } else if (json.message === 'no localization') {
            this.setAlarmCode(2020);
          } else if (json.message === 'target location out of range') {
            this.setAlarmCode(2018);
          } else if (json.message === 'target location occupied') {
            this.setAlarmCode(2021);
          } else if (json.message === 'target command not supported by multi') {
          } else if (json.message === 'not supported') {
          } else if (json.message === 'can not find node') {
            this.setAlarmCode(2018);
          } else if (json.message === 'empty node id') {
          } else {
            this.setAlarmCode(2021);
          }
        }

        this.server
          .to(['moveResponse', 'all', 'move'])
          .emit('moveResponse', json);
        socketLogger.debug(`[RESPONSE] SLAMNAV Move: ${JSON.stringify(json)}`);

        if (json.command === 'goal' || json.command === 'target') {
          if (json.result === 'success' || json.result === 'fail') {
            generateGeneralLog({
              logType: GeneralLogType.AUTO,
              status: GeneralStatus.RUN,
              scope: GeneralScope.VEHICLE,
              operationName: VehicleOperationName.MOVE,
              operationStatus: GeneralOperationStatus.END,
              data: global.orinGoalId + ' -> ' + global.targetGoalId,
            });
          } else if (json.result === 'accept') {
            // if (
            //   generateGeneralLog({
            //     logType: GeneralLogType.AUTO,
            //     status: GeneralStatus.RUN,
            //     scope: GeneralScope.VEHICLE,
            //     operationName: VehicleOperationName.READY,
            //     operationStatus: GeneralOperationStatus.END,
            //     data: global.orinGoalId +" -> "+global.targetGoalId
            //   })
            // ) {
            generateGeneralLog({
              logType: GeneralLogType.AUTO,
              status: GeneralStatus.RUN,
              scope: GeneralScope.VEHICLE,
              operationName: VehicleOperationName.MOVE,
              operationStatus: GeneralOperationStatus.START,
              data: global.orinGoalId + ' -> ' + global.targetGoalId,
            });
            // }
          } else if (json.result === 'reject') {
            // generateGeneralLog({
            //   logType: GeneralLogType.AUTO,
            //   status: GeneralStatus.RUN,
            //   scope: GeneralScope.VEHICLE,
            //   operationName: VehicleOperationName.READY,
            //   operationStatus: GeneralOperationStatus.END,
            //   data: global.orinGoalId +" -> "+global.targetGoalId
            // });
          }
        }

        if (this.frsSocket?.connected) {
          this.frsSocket.emit('moveResponse', {
            robotSerial: global.robotSerial,
            data: json,
          });
        }

        this.moveState = json;
      } else {
        socketLogger.warn(
          `[RESPONSE] another slamnav moveResponse ${this.slamnav?.id}, ${client.id}`,
        );
      }
    } catch (error) {
      this.setAlarmLog(10000);
      socketLogger.error(`[RESPONSE] SLAMNAV Move: ${errorToJson(error)}`);
      throw error;
    }
  }

  async setSequence(data: SequenceDto, scope: string) {
    try {
      /// 1) Dto 검사
      if (scope === undefined || scope === '') {
        throw new RpcException('scope 값이 없습니다.');
      }
      // if (
      //   !Object.values(['manipulator', 'torso', 'acs']).includes(
      //     scope.toLowerCase(),
      //   )
      // ) {
      //   throw new RpcException('scope 값이 형식과 일치하지 않습니다.');
      // }

      if (data.operationName === undefined || data.operationName === '') {
        throw new RpcException('operationName 값이 없습니다.');
      }
      if (data.operationStatus === undefined || data.operationStatus === '') {
        throw new RpcException('operationStatus 값이 없습니다.');
      }
      if (
        !Object.values(GeneralOperationStatus).includes(
          data.operationStatus as GeneralOperationStatus,
        )
      ) {
        throw new RpcException(
          'operationStatus 값이 형식과 일치하지 않습니다.',
        );
      } else {
        console.log(data);
      }

      /// 2) GeneralLog 저장
      if (scope === 'acs') {
        generateGeneralLog({
          logType: GeneralLogType.AUTO,
          status: GeneralStatus.RUN,
          scope: GeneralScope.EVENT,
          operationName: data.operationName,
          operationStatus: data.operationStatus as GeneralOperationStatus,
          data: data.data ?? '',
        });
      } else {
        generateGeneralLog({
          logType: GeneralLogType.AUTO,
          status: GeneralStatus.RUN,
          scope: scope,
          operationName: data.operationName,
          operationStatus: data.operationStatus as GeneralOperationStatus,
          data: data.data ?? '',
        });
      }
      return;
    } catch (error) {
      socketLogger.error(`[LOG] setSequence : ${errorToJson(error)}`);
      if (error instanceof RpcException) throw error;
      throw new RpcException('서버에 에러가 발생했습니다.');
    }
  }

  // 알람 상태 추적을 위한 맵 추가
  private activeAlarms: Map<number, boolean> = new Map();

  // 알람 상태 확인 함수
  private isAlarmActive(alarmCode: number): boolean {
    return this.activeAlarms.get(alarmCode) || false;
  }

  // 알람 상태 설정 함수
  private setAlarmState(alarmCode: number, active: boolean) {
    this.activeAlarms.set(alarmCode, active);
  }

  // 알람 상태 초기화 함수
  private clearAllAlarmStates() {
    this.activeAlarms.clear();
  }

  async setAlarmCode(alarmCode: number) {
    try {
      // 이미 활성화된 알람이면 중복 방지
      if (this.isAlarmActive(alarmCode)) {
        return;
      }

      await this.setAlarm({ alarmCode: alarmCode.toString(), state: true });
      const alarmEntity = await this.logService.getAlarmDetail(alarmCode);
      setAlarmGeneralLog(alarmEntity, GeneralOperationStatus.SET);
      this.setAlarmState(alarmCode, true);
    } catch (error) {}
  }

  async startAlarmCode(alarmCode: number) {
    try {
      // 이미 활성화된 알람이면 중복 방지
      if (this.isAlarmActive(alarmCode)) {
        return;
      }

      await this.setAlarm({ alarmCode: alarmCode.toString(), state: true });
      const alarmEntity = await this.logService.getAlarmDetail(alarmCode);
      setAlarmGeneralLog(alarmEntity, GeneralOperationStatus.START);
      this.setAlarmState(alarmCode, true);
    } catch (error) {}
  }

  async clearAlarmCode(alarmCode: number) {
    try {
      // 이미 비활성화된 알람이면 중복 방지
      if (!this.isAlarmActive(alarmCode)) {
        return;
      }

      await this.clearAlarm({ alarmCode: alarmCode.toString(), state: false });
      const alarmEntity = await this.logService.getAlarmDetail(alarmCode);
      setAlarmGeneralLog(alarmEntity, GeneralOperationStatus.END);
      this.setAlarmState(alarmCode, false);
    } catch (error) {}
  }

  async clearAlarm(data: AlarmDto) {
    try {
      /// 1) Get Alarm
      const alarmDetail = await this.logService.getAlarmDetail(data.alarmCode);

      /// 2) Check Before Alarm (중복 방지)
      const lastAlarm = await this.logService.getLastAlarm(data.alarmCode);
      if (lastAlarm) {
        if (
          data.alarmCode === lastAlarm.alarmCode &&
          data.state === lastAlarm.state
        ) {
          // socketLogger.warn(
          //   `[LOG] duplicate alarm : ${data.alarmCode} -> ${alarmDetail.alarmDescription}`,
          // );
          throw new RpcException('중복되는 알람코드');
        }
      }
      socketLogger.info(
        `[LOG] clear alarm : ${data.alarmCode} -> ${alarmDetail.alarmDescription}`,
      );

      /// 3) Generate AlarmDto
      const alarmDto = {
        alarmCode: data.alarmCode,
        alarmDetail: data.alarmDetail,
        emitFlag: false,
        state: data.state,
      };

      /// 4) Emit alarm
      this.server.to(['alarm', 'all']).emit('alarm', alarmDto);

      /// 5) save log
      this.logService.setAlarm(alarmDto);

      // /// 6) general log
      // const alarmEntity = await this.logService.getAlarmDetail(data.alarmCode);
      // setAlarmGeneralLog(alarmEntity, GeneralOperationStatus.SET);
    } catch (error) {
      if (error instanceof RpcException) throw error;
      socketLogger.error(`[LOG] clearAlarm? : ${errorToJson(error)}`);
      throw new RpcException('서버에 에러가 발생했습니다.');
    }
  }

  async setAlarm(data: AlarmDto) {
    try {
      /// 1) Get Alarm
      const alarmDetail = await this.logService.getAlarmDetail(data.alarmCode);

      /// 2) Check Before Alarm (중복 방지)
      const lastAlarm = await this.logService.getLastAlarm(data.alarmCode);
      if (lastAlarm) {
        if (
          data.alarmCode === lastAlarm.alarmCode &&
          data.state === lastAlarm.state
        ) {
          throw new RpcException('중복되는 알람코드');
          // socketLogger.warn(
          //   `[LOG] duplicate alarm : ${data.alarmCode} -> ${alarmDetail.alarmDescription}`,
          // );
        }
      }
      socketLogger.warn(
        `[LOG] set alarm : ${data.alarmCode} -> ${alarmDetail.alarmDescription}`,
      );

      /// 3) Generate AlarmDto
      const alarmDto = {
        alarmCode: data.alarmCode,
        alarmDetail: data.alarmDetail,
        emitFlag: false,
        state: data.state,
      };

      /// 4) Emit alarm
      this.server.to(['alarm', 'all']).emit('alarm', alarmDto);

      /// 5) save log
      this.logService.setAlarm(alarmDto);

      // /// 6) general log
      // const alarmEntity = await this.logService.getAlarmDetail(data.alarmCode);
      // setAlarmGeneralLog(alarmEntity, GeneralOperationStatus.SET);
    } catch (error) {
      if (error instanceof RpcException) throw error;
      socketLogger.error(`[LOG] setAlarm : ${errorToJson(error)}`);

      throw new RpcException('서버에 에러가 발생했습니다.');
    }
  }

  async setAlarmLog(code: number | string) {
    setAlarmGeneralLog(
      await this.logService.getAlarmDetail(code),
      GeneralOperationStatus.SET,
    );
  }
  async clearAlarmLog(code: number | string) {
    setAlarmGeneralLog(
      await this.logService.getAlarmDetail(code),
      GeneralOperationStatus.END,
    );
  }
  async startAlarmLog(code: number | string) {
    setAlarmGeneralLog(
      await this.logService.getAlarmDetail(code),
      GeneralOperationStatus.START,
    );
  }

  @SubscribeMessage('loadResponse')
  async handleLoadReponseMessage(
    @MessageBody() payload: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (client.id == this.slamnav?.id) {
        if (payload == null || payload == undefined) {
          socketLogger.warn(`[RESPONSE] loadResponse: NULL`);
          return;
        }

        const json = JSON.parse(payload);

        if (
          json.command == null ||
          json.command == undefined ||
          json.command == ''
        ) {
          socketLogger.warn(`[RESPONSE] loadResponse: Command NULL`);
          return;
        }

        this.server.to(['loadResponse', 'all']).emit('loadResponse', json);

        //samsung
        if (json.result === 'fail') {
          if (json.message === 'type error') {
            this.setAlarmCode(2004);
          } else {
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
          socketLogger.debug(`[CONNECT] Send TCP : ${json.result}`);
          this.tcpClient.write(json.result);
        }

        socketLogger.debug(
          `[RESPONSE] SLAMNAV loadResponse: ${JSON.stringify(json)}`,
        );
      } else {
        socketLogger.warn(
          `[RESPONSE] another slamnav loadResponse ${this.slamnav?.id}, ${client.id}`,
        );
      }
    } catch (error) {
      socketLogger.error(
        `[RESPONSE] SLAMNAV loadResponse: ${errorToJson(error)}`,
      );
      throw error;
    }
  }

  @SubscribeMessage('mappingResponse')
  async handleMappingReponseMessage(
    @MessageBody() payload: string,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      if (client.id == this.slamnav?.id) {
        if (payload == null || payload == undefined) {
          socketLogger.warn(`[RESPONSE] mappingResponse: NULL`);
          return;
        }

        const json = JSON.parse(payload);

        if (
          json.command == null ||
          json.command == undefined ||
          json.command == ''
        ) {
          socketLogger.warn(`[RESPONSE] mappingResponse: Command NULL`);
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
      throw error;
    }
  }

  @SubscribeMessage('localizationResponse')
  async handleLocalizationReponseMessage(@MessageBody() payload: string) {
    try {
      if (payload == null || payload == undefined) {
        socketLogger.warn(`[RESPONSE] localizationResponse: NULL`);
        return;
      }

      const json = JSON.parse(payload);

      if (
        json.command == null ||
        json.command == undefined ||
        json.command == ''
      ) {
        socketLogger.warn(`[RESPONSE] localizationResponse: Command NULL`);
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
      throw error;
    }
  }

  @SubscribeMessage('randomseqResponse')
  async handleRandomseqReponseMessage(@MessageBody() payload: string) {
    try {
      if (payload == null || payload == undefined) {
        socketLogger.warn(`[RESPONSE] randomseqResponse: NULL`);
        return;
      }

      const json = JSON.parse(payload);

      if (
        json.command == null ||
        json.command == undefined ||
        json.command == ''
      ) {
        socketLogger.warn(`[RESPONSE] randomseqResponse: Command NULL`);
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
      socketLogger.debug(
        `[RESPONSE] SLAMNAV randomseqResponse: ${JSON.stringify(json)}`,
      );
    } catch (error) {
      socketLogger.error(
        `[RESPONSE] SLAMNAV randomseqResponse: ${errorToJson(error)}`,
      );
      throw error;
    }
  }

  @SubscribeMessage('dockResponse')
  async handleDockReponseMessage(@MessageBody() payload: string) {
    try {
      if (payload == null || payload == undefined) {
        socketLogger.warn(`[RESPONSE] dockResponse: NULL`);
        return;
      }

      const json = JSON.parse(payload);

      if (
        json.command == null ||
        json.command == undefined ||
        json.command == ''
      ) {
        socketLogger.warn(`[RESPONSE] dockResponse: Command NULL`);
        return;
      }

      //samsung
      if (json.result === 'fail') {
        this.setAlarmCode(2007);
        // this.setAlarmCode(2215);
      } else if (json.result === 'reject') {
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
      throw error;
    }
  }

  @SubscribeMessage('lidarCloud')
  async handleLidarCloudMessage(@MessageBody() payload: any[]) {
    try {
      if (payload == null || payload == undefined || payload.length == 0) {
        socketLogger.warn(`[STATUS] lidarCloud: NULL`);
        return;
      }

      if (isEqual(payload, this.lastLidarCloud)) {
        // socketLogger.warn(`[STATUS] lidarCloud: Equal lastLidarCloud`);
        return;
      }
      this.lastLidarCloud = payload;

      this.server.to(['lidarCloud', 'all']).emit('lidarCloud', payload);

      if (this.frsSocket?.connected) {
        // this.frsSocket.emit('lidarCloud',msgpack.encode({robotSerial:global.robotSerial,data:payload}))
      }
    } catch (error) {
      socketLogger.error(`[STATUS] Lidar: ${errorToJson(error)}`);
      throw error;
    }
  }

  @SubscribeMessage('mappingCloud')
  async handleMappingCloudMessage(@MessageBody() payload: any[]) {
    try {
      if (payload == null || payload == undefined || payload.length == 0) {
        socketLogger.warn(`[STATUS] mappingCloud: NULL`);
        return;
      }

      if (isEqual(payload, this.lastMappingCloud)) {
        socketLogger.warn(`[STATUS] mappingCloud: Equal lastMappingCloud`);
        return;
      }
      this.lastMappingCloud = payload;

      this.server.to(['mappingCloud', 'all']).emit('mappingCloud', payload);
    } catch (error) {
      socketLogger.error(`[STATUS] Mapping Cloud: ${errorToJson(error)}`);
      throw error;
    }
  }

  @SubscribeMessage('pathResponse')
  async handlePathResponse(@MessageBody() payload: { time: string }) {
    if (
      payload == null ||
      payload == undefined ||
      payload.time == null ||
      payload.time == undefined ||
      payload.time == ''
    ) {
      socketLogger.warn(`[STATUS] pathResponse: NULL`);
      return;
    }

    const sendData = {
      robotSerial: global.robotSerial,
      data: payload,
    };
    this.frsSocket?.emit('pathResponse', sendData);
  }

  @SubscribeMessage('localPath')
  async handleLocalPathdMessage(@MessageBody() payload: any[]) {
    try {
      if (payload == null || payload == undefined || payload.length == 0) {
        socketLogger.warn(`[STATUS] localPath: NULL`);
        return;
      }

      if (isEqual(payload, this.lastLocalPath)) {
        socketLogger.warn(`[STATUS] localPath: Equal localPath`);
        return;
      }
      this.lastLocalPath = payload;

      this.server.to(['localPath', 'all', 'path']).emit('localPath', payload);

      // if (this.frsSocket?.connected && global.robotSerial != '') {
      //   const sendData = {
      //     robotSerial: global.robotSerial,
      //     data: payload,
      //   };
      //   this.frsSocket.emit('localPath', sendData);
      // }
    } catch (error) {
      socketLogger.error(`[STATUS] localPath: ${errorToJson(error)}`);
      throw error;
    }
  }

  @SubscribeMessage('globalPath')
  async handleGlobalPathdMessage(@MessageBody() payload: any[]) {
    try {
      if (payload == null || payload == undefined || payload.length == 0) {
        socketLogger.warn(`[STATUS] globalPath: NULL`);
        return;
      }

      if (isEqual(payload, this.lastGlobalPath)) {
        // socketLogger.warn(`[STATUS] globalPath: Equal lastGlobalPath`);
        return;
      }
      this.lastGlobalPath = payload;

      this.server.to(['globalPath', 'all', 'path']).emit('globalPath', payload);
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
      throw error;
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
      this.server
        .to(['taskInit', 'all', 'task'])
        .emit('taskInit', this.taskState);
    } catch (error) {
      socketLogger.error(`[INIT] Task Init: ${errorToJson(error)}`);
      throw error;
    }
  }

  @SubscribeMessage('taskVariables')
  async handleTaskVariablesMessage(@MessageBody() payload: any[]) {
    try {
      this.taskState.variables = payload;
      socketLogger.debug(`[INIT] Task Variables: ${JSON.stringify(payload)}`);
      this.server
        .to(['taskVariables', 'all', 'task'])
        .emit('taskVariables', payload);
    } catch (error) {
      socketLogger.error(`[INIT] Task Variables:  ${errorToJson(error)}`);
      throw error;
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
      throw error;
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
      throw error;
    }
  }

  @SubscribeMessage('motion')
  async handleMotionMessage(@MessageBody() payload: string) {
    try {
      if (payload == null || payload == undefined) {
        socketLogger.warn(`[COMMAND] motion: NULL`);
        return;
      }

      const json = JSON.parse(JSON.stringify(payload));
      this.slamnav?.emit('motion', json);
      socketLogger.debug(`[COMMAND] Motion: ${JSON.stringify(json)}`);
    } catch (error) {
      socketLogger.error(`[INIT] Motion:  ${errorToJson(error)}`);
      throw error;
    }
  }

  @SubscribeMessage('externalResponse')
  async handleExternalResponseMessage(@MessageBody() payload: string) {
    try {
      if (payload == null || payload == undefined) {
        socketLogger.warn(`[RESPONSE] externalResponse: NULL`);
        return;
      }
      const json = JSON.parse(payload);
      this.server
        .to(['externalResponse', 'all', 'external'])
        .emit('externalResponse', json);

      if (this.frsSocket?.connected) {
        this.frsSocket.emit('externalResponse', {
          robotSerial: global.robotSerial,
          data: json,
        });
      }

      //삼성전기 일반LOG용 시퀀스 작성 (임시)
      if (json.command === FootCommand.Move) {
        if (json.result === 'accept') {
          generateGeneralLog({
            logType: GeneralLogType.AUTO,
            status: GeneralStatus.RUN,
            scope: GeneralScope.FOOT,
            operationName: FootOperationName.MOVE,
            operationStatus: GeneralOperationStatus.START,
            data:
              'Foot_Position : ' +
              json.orinPose?.toString() +
              ', ' +
              json.goalPose?.toString(),
          });
        } else if (json.result === 'success') {
          generateGeneralLog({
            logType: GeneralLogType.AUTO,
            status: GeneralStatus.RUN,
            scope: GeneralScope.FOOT,
            operationName: FootOperationName.MOVE,
            operationStatus: GeneralOperationStatus.END,
            data:
              'Foot_Position : ' +
              json.orinPose?.toString() +
              ', ' +
              json.goalPose?.toString(),
          });
        } else if (json.result === 'fail') {
          generateGeneralLog({
            logType: GeneralLogType.AUTO,
            status: GeneralStatus.RUN,
            scope: GeneralScope.FOOT,
            operationName: FootOperationName.MOVE,
            operationStatus: GeneralOperationStatus.END,
            data:
              'Foot_Position : ' +
              json.orinPose?.toString() +
              ', ' +
              json.goalPose?.toString(),
          });
        }
      }

      socketLogger.debug(
        `[RESPONSE] externalResponse : ${JSON.stringify(json)}`,
      );
    } catch (error) {
      socketLogger.error(`[RESPONSE] externalResponse : ${errorToJson(error)}`);
      throw error;
    }
  }

  @SubscribeMessage('motionResponse')
  async handleMotionResponseMessage(@MessageBody() payload: string) {
    try {
      if (payload == null || payload == undefined) {
        socketLogger.warn(`[RESPONSE] motionResponse: NULL`);
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
        socketLogger.debug(`[CONNECT] Send TCP : ${json.result}`);
        this.tcpClient.write(json.result);
      }

      this.motionState = json;

      socketLogger.debug(`[RESPONSE] SLAMNAV Motion: ${JSON.stringify(json)}`);
    } catch (error) {
      socketLogger.error(`[RESPONSE] SLAMNAV Motion: ${errorToJson(error)}`);
      throw error;
    }
  }

  //samsung
  @SubscribeMessage('acsStart')
  async handleACSAutoRunStartMessage() {
    generateGeneralLog({
      logType: GeneralLogType.AUTO,
      status: GeneralStatus.RUN,
      scope: GeneralScope.EVENT,
      operationName: GeneralOperationName.AUTORUN_START,
      operationStatus: GeneralOperationStatus.SET,
    });
  }

  @SubscribeMessage('acsEnd')
  async handleACSAutoRunEndMessage() {
    generateGeneralLog({
      logType: GeneralLogType.AUTO,
      status: GeneralStatus.RUN,
      scope: GeneralScope.EVENT,
      operationName: GeneralOperationName.AUTORUN_END,
      operationStatus: GeneralOperationStatus.SET,
    });
  }
  @SubscribeMessage('swVersionInfo')
  async handleSwVersionInfoMessage(@MessageBody() payload?: string) {
    try {
      const json = JSON.parse(JSON.stringify(payload || '{}'));
      this.slamnav?.emit('swVersionInfo', json);
    } catch (error) {
      socketLogger.error(`[INIT] swVersionInfo: ${errorToJson(error)}`);
      throw error;
    }
  }

  @SubscribeMessage('swVersionInfoResponse')
  async handleSwVersionInfoResponseMessage(@MessageBody() payload: string) {
    try {
      const json = JSON.parse(payload || '{}');
      this.server
        .to(['swVersionInfoResponse', 'all'])
        .emit('swVersionInfoResponse', json);
    } catch (error) {
      socketLogger.error(`[INIT] swVersionInfoResponse: ${errorToJson(error)}`);
      throw error;
    }
  }

  @SubscribeMessage('swUpdate')
  async handleSwUpdateMessage(@MessageBody() payload: string) {
    try {
      const json = JSON.parse(JSON.stringify(payload || '{}'));

      if (!json.version) {
        socketLogger.warn(`[COMMAND] swUpdate: version is null/undefined`);
        return;
      }

      this.slamnav?.emit('swUpdate', json);
    } catch (error) {
      socketLogger.error(`[INIT] swUpdate: ${errorToJson(error)}`);
      throw error;
    }
  }

  @SubscribeMessage('swUpdateResponse')
  async handleSwUpdateResponseMessage(@MessageBody() payload: string) {
    try {
      const json = JSON.parse(
        payload ||
          '{"applyReqUpdate": false, "version": "", "rejectReason": "Bad Response"}',
      );

      this.server
        .to(['swUpdateResponse', 'all'])
        .emit('swUpdateResponse', json);
    } catch (error) {
      socketLogger.error(`[INIT] swUpdateResponse: ${errorToJson(error)}`);
      throw error;
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
      this.server.to(['Webinit', 'all']).emit('Webinit', payload);
    } catch (error) {
      socketLogger.error(`[INIT] Web Init: ${errorToJson(error)}`);
      throw error;
    }
  }

  @SubscribeMessage('alarm')
  async handleAlarmLogMessage(@MessageBody() payload: AlarmDto) {
    try {
      if (payload.state) {
        this.server.to(['alarm']).emit('alarm', payload);
      } else {
        this.server.to(['alarm', 'alarmClear']).emit('alarmClear', payload);
      }
      this.logService.writeAlarmLog(
        payload.alarmCode,
        payload.alarmDetail,
        payload.state,
      );
    } catch (error) {
      socketLogger.error(`[LOG] alarmLog: ${errorToJson(error)}`);
      throw error;
    }
  }

  @SubscribeMessage('equipmentLog')
  async handleEquipmentLogMessage(
    @MessageBody() payload: { form: FormType; data: any },
  ) {
    if (typeof payload === 'string') {
      payload = JSON.parse(payload);
    }

    console.log('equipmentLog : ', payload.form);

    switch (payload.form) {
      case FormType.MANIPULATOR:
        // const parseManipulatorPosition = await this.parseManipulatorPosition(
        //   payload.data,
        // );

        const parseManipulatorPosition: {
          position: ManipulatorType;
          datetime: string;
          x: number;
          y: number;
          z: number;
          rx: number;
          ry: number;
          rz: number;
          base: number;
          shoulder: number;
          elbow: number;
          wrist1: number;
          wrist2: number;
        } = payload.data;

        if (parseManipulatorPosition.position === ManipulatorType.LEFT) {
          generateManipulatorLog(
            {
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
            },
            `${ManipulatorType.LEFT}_Manipulator_position`,
          );
        } else if (
          parseManipulatorPosition.position === ManipulatorType.RIGHT
        ) {
          generateManipulatorLog(
            {
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
            },
            `${ManipulatorType.RIGHT}_Manipulator_Position`,
          );
        }

        break;
      case FormType.TORSO:
        // const parseTorsoPosition = await this.parseTorsoPosition(payload.data);
        const parseTorsoPosition: {
          datetime: string;
          x: number;
          z: number;
          theta: number;
        } = payload.data;

        generateTorsoLog(
          {
            dateTime: parseTorsoPosition.datetime,
            x: parseTorsoPosition.x,
            z: parseTorsoPosition.z,
            theta: parseTorsoPosition.theta,
          },
          `Torso_Position`,
        );
        break;
      case FormType.AMR:
        const parseData = payload.data;
        if (parseData.kind === AmrLogType.VELOCITY) {
          generateAmrVelocityLog(
            {
              dateTime: parseData.datetime,
              x: parseData.x,
              y: parseData.y,
              theta: parseData.theta,
              xVel: parseData.xVel,
              yVel: parseData.yVel,
            },
            `Mobile_Position_Velocity`,
          );
        } else if (parseData.kind === AmrLogType.OBSTACLE) {
          generateAmrObstacleLog(
            {
              dateTime: parseData.datetime,
              statusFront: parseData.statusFront,
              distanceFront: parseData.distanceFront,
              thetaFront: parseData.thetaFront,
              statusBack: parseData.statusBack,
              distanceBack: parseData.distanceBack,
              thetaBack: parseData.thetaBack,
            },
            `Lidar_Recognize_Obstacle`,
          );
        } else if (parseData.kind === AmrLogType.DOCKING_PRECISION) {
          generateAmrDockingPrecisionLog(
            {
              dateTime: parseData.datetime
                .toISOString()
                .replace('T', ' ')
                .substring(0, 23),
              twoDMarkerRecognizePosition:
                parseData.twoDMarkerRecognizePosition,
            },
            `Mobile_Charging_Docking_Precision`,
          );
        } else if (parseData.kind === AmrLogType.MOVING_PRECISION) {
          generateAmrMovingPrecisionLog(
            {
              dateTime: parseData.datetime
                .toISOString()
                .replace('T', ' ')
                .substring(0, 23),
              twoDMarkerRecognizePosition:
                parseData.twoDMarkerRecognizePosition,
            },
            `Mobile_Moving_Precision`,
          );
        }

        break;
      default:
        break;
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
