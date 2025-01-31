import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  OnGatewayInit,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as ioClient from 'socket.io-client';
import { io } from 'socket.io-client';
import socketLogger from '@common/logger/socket.logger';
import {
  defaultTaskPayload,
  TaskPayload,
} from '@common/interface/robot/task.interface';
import {
  MovePayload,
  defaultMovePayload,
} from '@common/interface/robot/move.interface';
import {
  defaultStatusPayload,
  StatusPayload,
} from '@common/interface/robot/status.interface';
import { getMacAddresses, stringifyAllValues } from '@common/util/network.util';
import { Global, OnModuleDestroy } from '@nestjs/common';
import * as pako from 'pako';
import { connect } from 'http2';
import { TransformationType } from 'class-transformer';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MqttClientService } from '@sockets/mqtt/mqtt.service';
import { errorToJson } from '@common/util/error.util';
import { KafkaClientService } from '@sockets/kafka/kafka.service';

@Global()
@WebSocketGateway(11337)
export class SocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy
{
  constructor(private readonly mqttService:MqttClientService,private readonly kafakService:KafkaClientService){
  }
  @WebSocketServer()
  server: Server; // WebSocket server 객체
  socket: Socket;

  slamnav: Socket;
  taskman: Socket;

  taskState: TaskPayload = defaultTaskPayload;
  moveState: MovePayload = defaultMovePayload;
  robotState: StatusPayload = defaultStatusPayload;
  frsSocket: ioClient.Socket = null;
  lidarCloud: any[] = [];

  interval_frs = null;

  async connectFrsSocket(url:string){
    try{
      if(this.frsSocket?.connected){
        this.frsSocket.disconnect();
        socketLogger.info(`[CONNECT] FRS Socket disconnect`);
        clearInterval(this.interval_frs);
        this.frsSocket.close();
        global.frsConnect = false;
        this.frsSocket = null;
      }

      this.frsSocket = io(url,{transports:["websocket"]});
      this.frsSocket.off();
      socketLogger.debug(`[CONNECT] FRS Socket URL: ${url}`);
  
      this.frsSocket.on('connect', () => {
        socketLogger.info(`[CONNECT] FRS Socket connected`);
        global.frsConnect = true;
        global.robotMcAdrs = getMacAddresses()[0].mac;
  
        const sendData = {
          robotMcAdrs: global.robotMcAdrs,
          robotIpAdrs: (global.ip_wifi=="" || global.ip_wifi == undefined)?global.ip_ethernet:global.ip_wifi
        };

        socketLogger.debug(`[CONNECT] FRS robots-init : ${JSON.stringify(sendData)}`);
        this.frsSocket.emit('robots-init', pako.gzip(JSON.stringify(sendData)));

        this.interval_frs = setInterval(() => {
          if(this.frsSocket.connected && global.robotUuid != ""){
            if(this.slamnav){
              const lidarData = {
                robotUuid: global.robotUuid,
                data: this.lidarCloud
              };
              // socketLogger.debug(`[CONNECT] FRS emit Lidar : ${global.robotUuid}`);
              // frsSocket.emit("rrs-lidar",pako.gzip(JSON.stringify(lidarData)));
            }
            // const statusData = {
            //   robotUuid: global.robotUuid,
            //   status: {...this.robotState, slam:this.slamnav?true:false, task:this.taskState},
            // };
            const statusData = {
              robotUuid: global.robotUuid,
              status: {slam:this.slamnav?true:false, task:this.taskState},
            };
            socketLogger.debug(`[CONNECT] FRS emit Status : ${global.robotUuid}, ${this.robotState.time}`);
            this.frsSocket.emit("program-status", pako.gzip(JSON.stringify(statusData)));
          }
        }, 5000);
      });

      this.frsSocket.on('disconnect', (data) => {
        socketLogger.error(`[CONNECT] FRS Socket disconnected: ${errorToJson(data)}`);
        global.frsConnect = false;
        clearInterval(this.interval_frs);
      });

      this.frsSocket.on('error', (error) => {
        socketLogger.error(`[CONNECT] FRS Socket error: ${errorToJson(error)}`);
      })

      this.frsSocket.on('robots-init', (data) => {
        try{
          const json = JSON.parse(pako.ungzip(data, {to:'string'}));
          socketLogger.debug(`[INIT] FRS Get robots-init: ${JSON.stringify(json)}`)
          if (json.robotMcAdrs == global.robotMcAdrs) {
            socketLogger.info(`[INIT] Get Robot UUID from FRS: uuid(${json.robotUuid}), ip(${json.robotIpAdrs}), mc(${json.robotMcAdrs}), name(${json.robotNm})`);
            global.robotNm = json.robotNm;
            global.robotUuid = json.robotUuid;
            global.robotMcAdrs = json.robotMcAdrs;
          }
          this.mqttService.connect();
          this.kafakService.connect();
        }catch(error){
          socketLogger.error(`[INIT] FrsSocket robots-init Error : ${JSON.stringify(data)}, ${errorToJson(error)}`)
        }
      });

      this.frsSocket.on('move',(data) => {
        try{
          const json = JSON.parse(pako.ungzip(data, {to:'string'}));
          socketLogger.debug(`[COMMAND] FRS Move: ${JSON.stringify(json)}`);
          if(this.slamnav){
              this.slamnav.emit("move",stringifyAllValues(json))
          }
        }catch(error){
          socketLogger.error(`[COMMAND] FRS Move: ${JSON.stringify(data)}, ${errorToJson(error)}`)
        }
      })
    }catch(error){
      socketLogger.error(`[CONNECT] FRS Socket connect`);
    }
  }

  onModuleDestroy() {
    socketLogger.warn(`[CONNECT] Socket Gateway Destroy`)
    this.frsSocket.disconnect();
  }

  // 클라이언트가 연결되면 룸에 join 시킬 수 있음
  handleConnection(client: Socket) {
    socketLogger.info(`[CONNECT] New Client: Name(${client.handshake.query.name}), IP(${client.handshake.address}), ID(${client.id})`)
    if (client.handshake.query.name == 'slamnav') {
      this.slamnav = client;
    }else if (client.handshake.query.name == 'taskman') {
      this.taskman = client;
      this.taskState.connection = true;
      this.taskman.emit('file')
    }
    client.join(client.handshake.query.name);
  }

  // 클라이언트가 연결 해제되면 룸에서 leave 시킬 수 있음
  handleDisconnect(client: Socket) {
    socketLogger.info(`[CONNECT] Client disconnected: Name(${client.handshake.query.name}), IP(${client.handshake.address}), ID(${client.id})`)

    if (client.handshake.query.name == 'slamnav') {
      if (this.moveState.result == 'accept') {
        this.server.emit('moveResponse', {
          ...this.moveState,
          result: 'fail',
          message: 'disconnected',
        });
      }
      this.slamnav = null;
      this.moveState = defaultMovePayload;

      //TaskStop
      if (this.taskState.running) {
        this.server.emit('taskStop', 'disconnected');
      }
    } else if (client.handshake.query.name == 'taskman') {
      this.taskState = defaultTaskPayload;
      this.taskman = null;
    }
    client.leave(client.handshake.query.name as string);
  }

  /**
   * @description 태스크 시작/종료/에러 메시지를 처리하는 함수
   * @param socket
   * @param payload 로봇 라이다 데이터
   */
  @SubscribeMessage('task_start')
  async handleTaskStartMessage(
    @MessageBody()
    payload: TaskPayload,
  ) {
    try {
      this.taskState.file = payload.file;
      this.taskState.id = payload.id;
      this.taskState.running = payload.running;
      socketLogger.debug(
        `[RESPONSE] Task Start: ${JSON.stringify(payload)}`
      );
      this.server.emit('task_start', payload);
    } catch (error) {
      socketLogger.error(`[RESPONSE] Task Start: ${errorToJson(error)}`);
    }
  }
  @SubscribeMessage('task_done')
  async handleTaskDoneMessage(
    @MessageBody()
    payload: TaskPayload,
  ) {
    try {
      this.taskState.file = payload.file;
      this.taskState.id = payload.id;
      this.taskState.running = payload.running;
      socketLogger.debug(
        `[RESPONSE] Task Done : ${JSON.stringify(payload)}`
      );
      this.server.emit('task_done', payload);
    } catch (error) {
      socketLogger.error(`[RESPONSE] Task Done: ${errorToJson(error)}`);
    }
  }

  @SubscribeMessage('task_load')
  async handleTaskLoadMessage(@MessageBody() payload:TaskPayload){
    try {
      this.taskState.file = payload.file;
      this.taskState.id = payload.id;
      this.taskState.running = payload.running;
      socketLogger.debug(
        `[RESPONSE] Task Load : ${JSON.stringify(payload)}`
      );
      this.server.emit('task_load', payload);
    } catch (error) {
      socketLogger.error(`[RESPONSE] Task Load: ${errorToJson(error)}`);

    }
  }
  
  @SubscribeMessage('task_error')
  async handleTaskErrorMessage(
    @MessageBody()
    payload: TaskPayload,
  ) {
    try {
      this.taskState.file = payload.file;
      this.taskState.id = payload.id;
      this.taskState.running = payload.running;
      socketLogger.debug(
        `[RESPONSE] Task Error : ${JSON.stringify(payload)}`
      );
      this.server.emit('task_error', payload);
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
  @SubscribeMessage('task_id')
  async handleTaskIdMessage(@MessageBody() payload: number) {
    try {
      socketLogger.debug(`[RESPONSE] Task Id Change : ${JSON.stringify(payload)}`);
      this.taskState.id = payload;
      this.server.emit('task_id', payload);
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
  @SubscribeMessage('moveCommand')
  async handleMoveCommandMessage(@MessageBody() payload: string) {
    try {
      const json = JSON.parse(JSON.stringify(payload));
      this.server.to('slamnav').emit('move', json);

      socketLogger.debug(
        `[COMMAND] Task Move: ${JSON.stringify(json)}`,
      );
    } catch (error) {
      socketLogger.error(`[COMMAND] Task Move: ${errorToJson(error)}`);
      throw error();
    }
  }

  @SubscribeMessage('status')
  async handleStatusMessage(@MessageBody() payload: string){
    const json = JSON.parse(payload);
    this.server.emit('status',{...json,task:this.taskState,slam:this.slamnav?true:false});
    if(this.frsSocket.connected){
      this.frsSocket.emit('status',json);
    }
    this.robotState = {...this.robotState,...json};
    //  console.debug('status in ',this.robotState )
  }

  @SubscribeMessage('working_status')
  async handleWorkingStatusMessage(@MessageBody() payload: string){
    const json = JSON.parse(payload);
    this.server.emit('working_status',json);
    if(this.frsSocket.connected){
      this.frsSocket.emit('working_status',json);
    }
    this.robotState = {...this.robotState,...json};
    // console.log('working status in ',this.robotState)
  }

  /**
   * @description SLAMNAV의 이동 응답 메시지를 처리하는 함수
   * @param socket
   * @param payload 로봇 이동 변수
   */
  @SubscribeMessage('moveResponse')
  async handleMoveReponseMessage(@MessageBody() payload: string) {
    try {
      const json = JSON.parse(payload);
      this.server.emit('moveResponse', json);
      this.moveState = json;

      socketLogger.debug(
        `[RESPONSE] SLAMNAV Move: ${JSON.stringify(json)}`,
      );
    } catch (error) {
      socketLogger.error(`[RESPONSE] SLAMNAV Move: ${errorToJson(error)}`);
      throw error();
    }
  }

  /**
   * @description SLAMNAV의 이동 응답 메시지를 처리하는 함수
   * @param socket
   * @param payload 로봇 이동 변수
   */
  @SubscribeMessage('move')
  async handleMoveMessage(@MessageBody() payload: string) {
    try {
      const json = JSON.parse(payload);
      if(json.result){
        this.server.emit('moveResponse', json);
        this.moveState = json;
  
        socketLogger.debug(
          `[RESPONSE] SLAMNAV Move: ${JSON.stringify(json)}`,
        );
      }
    } catch (error) {
      socketLogger.error(`[RESPONSE] SLAMNAV Move: ${errorToJson(error)}`);
      throw error();
    }
  }

  @SubscribeMessage('lidar_cloud')
  async handleLidarCloudMessage(@MessageBody() payload:any[]){
    try{
      this.server.emit("lidar",payload);
      this.lidarCloud = payload;
    }catch(error){
      socketLogger.error(`[STATUS] Lidar: ${errorToJson(error)}`);
      throw error();
    }
  }

  @SubscribeMessage('mapping_cloud')
  async handleMappingCloudMessage(@MessageBody() payload:any[]){
    try{
      this.server.emit("mapping",payload);
    }catch(error){
      socketLogger.error(`[STATUS] Mapping Cloud: ${errorToJson(error)}`);
      throw error();
    }
  }

  @SubscribeMessage('local_path')
  async handleLocalPathdMessage(@MessageBody() payload:any[]){
    try{
      this.server.emit("local_path",payload);
      if(this.frsSocket.connected && global.robotUuid != ""){
        const sendData = {
          robotUuid: global.robotUuid,
          data: payload,
        };
        this.frsSocket.emit("local-path", pako.gzip(JSON.stringify(sendData)));
      }
    }catch(error){
      socketLogger.error(`[STATUS] LocalPath: ${errorToJson(error)}`);
      throw error();
    }
  }
  @SubscribeMessage('global_path')
  async handleGlobalPathdMessage(@MessageBody() payload:any[]){
    try{
      this.server.emit("global_path",payload);
      socketLogger.debug(`[STATUS] GlobalPath: ${JSON.stringify(payload)}`)
      if(this.frsSocket.connected && global.robotUuid != ""){
        const sendData = {
          robotUuid: global.robotUuid,
          data: payload,
        };
        this.frsSocket.emit("global-path", pako.gzip(JSON.stringify(sendData)));
      }
    }catch(error){
      socketLogger.error(`[STATUS] GlobalPath: ${errorToJson(error)}`);
      throw error();
    }
  }

  /**
   * @description 태스크 변수 초기화를 처리하는 함수
   * @param socket
   * @param payload 로봇 태스크 데이터
   */
  @SubscribeMessage('task_init')
  async handleTaskInitMessage(
    @MessageBody() payload: { file: string; id: number; running: boolean; variables: any[]},
  ) {
    try {
      this.taskState.file = payload.file;
      this.taskState.id = payload.id;
      this.taskState.running = payload.running;
      socketLogger.debug(`[INIT] Task Init: ${JSON.stringify(payload)}`);
      this.server.emit('task_init', this.taskState);
    } catch (error) {
      socketLogger.error(`[INIT] Task Init: ${errorToJson(error)}`);
      throw error();
    }
  }

  @SubscribeMessage('task_variables')
  async handleTaskVariablesMessage(
    @MessageBody() payload:any[]
  ){
    try {
      this.taskState.variables = payload;
      socketLogger.debug(`[INIT] Task Variables: ${JSON.stringify(payload)}`);
      this.server.emit('task_variables',this.taskState);
    } catch (error) {
      socketLogger.error(`[INIT] Task Variables:  ${errorToJson(error)}`);
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

      socketLogger.debug(
        `[INIT] Web Init : ${JSON.stringify(payload)}`,
      );
      this.server.emit('Webinit', payload);
    } catch (error) {
      socketLogger.error(`[INIT] Web Init: ${errorToJson(error)}`);
      throw error();
    }
  }
  


  //****************************************************** functions */
  getConnection(){
    // console.log(this.slamnav, this.taskman);
    return({
      SLAMNAV:this.slamnav? true: false,
      TASK:this.taskman?true:false
    })
  }
}
