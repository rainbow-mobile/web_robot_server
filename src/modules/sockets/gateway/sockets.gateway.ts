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

@Global()
@WebSocketGateway(11337)
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy
{
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

  async afterInit(server: Server) {

  }

  async connectFrsSocket(url:string){
    try{
      if(this.frsSocket?.connected){
        this.frsSocket.disconnect();
        socketLogger.info(`FRS Socket disconnect`);
        clearInterval(this.interval_frs);
        this.frsSocket.close();
        global.frsConnect = false;
        this.frsSocket = null;
      }

      this.frsSocket = io(url
      );
      this.frsSocket.off();
  
      this.frsSocket.on('connect', () => {
        socketLogger.info(`FRS Socket connected`);
        global.frsConnect = true;

        global.robotMcAdrs =getMacAddresses()[0].mac;
  
        const sendData = {
          robotMcAdrs: global.robotMcAdrs,
          robotIpAdrs: (global.ip_wifi=="" || global.ip_wifi == undefined)?global.ip_ethernet:global.ip_wifi
        };

        this.frsSocket.emit('robots-init', pako.gzip(JSON.stringify(sendData)));

        this.interval_frs = setInterval(() => {
          if(this.frsSocket.connected && global.robotUuid != ""){
            if(this.slamnav){
              const lidarData = {
                robotUuid: global.robotUuid,
                data: this.lidarCloud
              };
              // frsSocket.emit("rrs-lidar",pako.gzip(JSON.stringify(lidarData)));
            }
            const statusData = {
              robotUuid: global.robotUuid,
              status: {...this.robotState, slam:this.slamnav?true:false, task:this.taskState},
            };
            console.log("FRS emit ",global.robotUuid);
            this.frsSocket.emit("robots-status", pako.gzip(JSON.stringify(statusData)));
            
          }
        }, 5000);

      });

      this.frsSocket.on('disconnect', (data) => {
        socketLogger.error(`FRS Socket disconnected, ${data}`);
        global.frsConnect = false;
        clearInterval(this.interval_frs);
      });

      this.frsSocket.on('error', (error) => {
        socketLogger.error(error);
      })
      this.frsSocket.on('robots-init', (data) => {
        const json = JSON.parse(pako.ungzip(data, {to:'string'}));
        console.log("robots-init : ", json.robotMcAdrs)
        if (json.robotMcAdrs == global.robotMcAdrs) {
          socketLogger.info(`Get Robot UUID : uuid(${json.robotUuid}), ip(${json.robotIpAdrs}), mc(${json.robotMcAdrs}), name(${json.robotNm})`);
          global.robotNm = json.robotNm;
          global.robotUuid = json.robotUuid;
          global.robotMcAdrs = json.robotMcAdrs;
        }
      });

      this.frsSocket.on('move',(data) => {
        try{
          const json = JSON.parse(pako.ungzip(data, {to:'string'}));
          socketLogger.info(`FrsSocket Move Command : ${json.command}, ${json.id}`);


          if(this.slamnav){
              this.slamnav.emit("move",stringifyAllValues(json))
          }

        }catch(error){
          socketLogger.error(`FrsSocket move Error : ${error}`)
        }
      })
    }catch(error){
      console.error(error);
    }
  }

  onModuleDestroy() {
    console.log("DISTROYs")
    this.frsSocket.disconnect();
  }

  // 클라이언트가 연결되면 룸에 join 시킬 수 있음
  handleConnection(client: Socket) {
    console.log(
      `Client connected: ${client.handshake.query.name}, ${client.id}`,
    );
    console.log(client.handshake.address.split(':')[3]);
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
    console.log(
      `Client disconnected: ${client.handshake.query.name}, ${client.id}`,
    );

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
        `Task Start : ${payload.file}, ${payload.id}, ${payload.running}`,
      );
      this.server.emit('task_start', payload);
    } catch (error) {
      socketLogger.error(error.stack);
      throw error();
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
        `Task Done : ${payload.file}, ${payload.id}, ${payload.running}`,
      );
      this.server.emit('task_done', payload);
    } catch (error) {
      socketLogger.error(error.stack);
      throw error();
    }
  }

  @SubscribeMessage('task_load')
  async handleTaskLoadMessage(@MessageBody() payload:TaskPayload){
    this.taskState.file = payload.file;
    this.taskState.id = payload.id;
    this.taskState.running = payload.running;
    socketLogger.debug(
      `Task Load : ${payload.file}, ${payload.id}, ${payload.running}`,
    );
    this.server.emit('task_load', payload);
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
        `Task Error : ${payload.file}, ${payload.id}, ${payload.running}`,
      );
      this.server.emit('task_error', payload);
    } catch (error) {
      socketLogger.error(error.stack);
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
      socketLogger.debug(`Task Id Change : ${payload}`);
      this.taskState.id = payload;
      this.server.emit('task_id', payload);
    } catch (error) {
      socketLogger.error(error.stack);
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
      const json = JSON.parse(payload);
      this.server.to('slamnav').emit('move', json);

      if (json.command == 'target') {
        socketLogger.debug(
          `Task Move Command : ${json.command}, ${json.x}, ${json.y}, ${json.rz}, ${json.preset}`,
        );
      } else if (json.command == 'goal') {
        socketLogger.debug(
          `Task Move Command : ${json.command}, ${json.id}, ${json.preset}`,
        );
      } else {
        socketLogger.debug(`Task Move Command : ${json.command}`);
      }
      //   this.server.to('/slamnav').emit('move', json);
    } catch (error) {
      socketLogger.error(error.stack);
      throw error();
    }
  }

  @SubscribeMessage('status')
  async handleStatusMessage(@MessageBody() payload: string){
    const json = JSON.parse(payload);
    this.server.emit('status',{...json,task:this.taskState,slam:this.slamnav?true:false});
    this.robotState = json;
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

      if (json.command == 'target') {
        socketLogger.debug(
          `SLAMNAV Move Response : ${json.command}, ${json.result}, ${json.x}, ${json.y}, ${json.rz}, ${json.preset}`,
        );
      } else if (json.command == 'goal') {
        socketLogger.debug(
          `SLAMNAV Move Response : ${json.command}, ${json.result}, ${json.id}, ${json.preset}`,
        );
      } else {
        socketLogger.debug(
          `SLAMNAV Move Response : ${json.command}, ${json.result} `,
        );
      }
    } catch (error) {
      socketLogger.error(error.stack);
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
  
        if (json.command == 'target') {
          socketLogger.debug(
            `SLAMNAV Move Response : ${json.command}, ${json.result}, ${json.x}, ${json.y}, ${json.rz}, ${json.preset}`,
          );
        } else if (json.command == 'goal') {
          socketLogger.debug(
            `SLAMNAV Move Response : ${json.command}, ${json.result}, ${json.id}, ${json.preset}`,
          );
        } else {
          socketLogger.debug(
            `SLAMNAV Move Response : ${json.command}, ${json.result} `,
          );
        }
      }
    } catch (error) {
      socketLogger.error(error.stack);
      throw error();
    }
  }

  @SubscribeMessage('lidar_cloud')
  async handleLidarCloudMessage(@MessageBody() payload:any[]){
    try{
      this.server.emit("lidar",payload);
      this.lidarCloud = payload;
    }catch(error){
      socketLogger.error(error.stack);
      throw error();
    }
  }

  @SubscribeMessage('mapping_cloud')
  async handleMappingCloudMessage(@MessageBody() payload:any[]){
    try{
      this.server.emit("mapping",payload);
    }catch(error){
      socketLogger.error(error.stack);
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
      socketLogger.error(error.stack);
      throw error();
    }
  }
  @SubscribeMessage('global_path')
  async handleGlobalPathdMessage(@MessageBody() payload:any[]){
    try{
      this.server.emit("global_path",payload);
      if(this.frsSocket.connected && global.robotUuid != ""){
        const sendData = {
          robotUuid: global.robotUuid,
          data: payload,
        };
        this.frsSocket.emit("global-path", pako.gzip(JSON.stringify(sendData)));
      }
    }catch(error){
      socketLogger.error(error.stack);
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
      socketLogger.debug(
        `Task Init : ${payload.file}, ${payload.id}, ${payload.running}`,
      );
      this.server.emit('task_init', this.taskState);
    } catch (error) {
      socketLogger.error(error.stack);
      throw error();
    }
  }

  @SubscribeMessage('task_variables')
  async handleTaskVariablesMessage(
    @MessageBody() payload:any[]
  ){
    try {
      this.taskState.variables = payload;
      socketLogger.debug(`Task Variables : ${payload.length}`);
      this.server.emit('task_variables',this.taskState);
    } catch (error) {
      socketLogger.error(error.stack);
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
        `Web Init : ${this.taskState.file}, ${this.taskState.id}, ${this.taskState.running}, ${this.moveState.command}, ${this.moveState.result}`,
      );
      this.server.emit('Webinit', payload);
    } catch (error) {
      socketLogger.error(error.stack);
      throw error();
    }
  }

  @SubscribeMessage('taskLoad')
  async handleTest() {
    console.log('taskLoad');
  }



  //****************************************************** functions */

  // 특정 클라이언트에 메시지 전송
  sendEmit(command: string, message: string): void {
    socketLogger.debug(`send Emit ${command} : ${message}`);
    this.server.emit(command, JSON.parse(message));
  }

  getConnection(){
    // console.log(this.slamnav, this.taskman);
    return({
      SLAMNAV:this.slamnav? true: false,
      TASK:this.taskman?true:false
    })
  }
}
