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
import { Payload } from '@nestjs/microservices';

@Global()
@WebSocketGateway(11337,{
  transports:['websocket'],
  cors:{
    origin:"*",
    methods:["GET","POST"],
    credentials:true
  },
  host:"0.0.0.0"
})
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
  
          const sendData = {
            robotSerial: global.robotSerial,
            robotIpAdrs: (global.ip_wifi=="" || global.ip_wifi == undefined)?global.ip_ethernet:global.ip_wifi
          };
  
          socketLogger.debug(`[CONNECT] FRS init : ${JSON.stringify(sendData)}`);
          this.frsSocket.emit('init', sendData);
      });

      this.frsSocket.on('disconnect', (data) => {
        socketLogger.error(`[CONNECT] FRS Socket disconnected: ${errorToJson(data)}`);
        global.frsConnect = false;
        clearInterval(this.interval_frs);
      });

      this.frsSocket.on('error', (error) => {
        socketLogger.error(`[CONNECT] FRS Socket error: ${errorToJson(error)}`);
      })

      this.frsSocket.on('init', (data) => {
        try{
          const json = JSON.parse(data);
          socketLogger.debug(`[INIT] FRS Get init: ${JSON.stringify(json)}`)
          console.log(json.robotSerial, global.robotSerial)
          if (json.robotSerial == global.robotSerial) {
            socketLogger.info(`[INIT] Get Robot Info from FRS: SerialNumber(${json.robotSerial}), ip(${json.robotIpAdrs}), name(${json.robotNm})`);
            global.robotNm = json.robotNm;

            console.log(global.robotNm)
            
            this.interval_frs = setInterval(() => {
              if(this.frsSocket.connected && global.robotSerial != ""){
                if(this.slamnav){
                  const statusData = {
                    robotSerial: global.robotSerial,
                    data: {
                      slam:{connection:this.slamnav?true:false}, 
                      task:this.taskState
                    },
                };
                socketLogger.debug(`[CONNECT] FRS emit Status : ${global.robotSerial}, ${this.robotState.time}`);
                this.server.emit("programStatus", statusData.data);
                this.frsSocket.emit("programStatus", statusData);
              }
            }
            }, 1000);
          }
          // to be continue...
          // this.mqttService.connect();
          // this.kafakService.connect();
        }catch(error){
          socketLogger.error(`[INIT] FrsSocket init Error : ${JSON.stringify(data)}, ${errorToJson(error)}`)
        }
      });

      this.frsSocket.on('move',(data) => {
        try{
          const json = JSON.parse(data);
          socketLogger.debug(`[COMMAND] FRS Move: ${JSON.stringify(json)}`);
          if(this.slamnav){
            this.slamnav.emit("move",stringifyAllValues(json))
          }else{
            this.frsSocket.emit("moveResponse",{robotSerial:global.robotSerial,data:{...data,result:'fail',message:'SLAMNAV2 disconnected'}});
          }
        }catch(error){
          socketLogger.error(`[COMMAND] FRS Move: ${JSON.stringify(data)}, ${errorToJson(error)}`)
        }
      })

      this.frsSocket.on('load',(data) => {
        try{
          const json = JSON.parse(data);
          socketLogger.debug(`[COMMAND] FRS Load: ${JSON.stringify(json)}`);
          if(this.slamnav){
              this.slamnav.emit("load",stringifyAllValues(json))
          }else{
            this.frsSocket.emit("loadResponse",{robotSerial:global.robotSerial,data:{...data,result:'fail',message:'SLAMNAV2 disconnected'}});
          }
        }catch(error){
          socketLogger.error(`[COMMAND] FRS MapLoad: ${JSON.stringify(data)}, ${errorToJson(error)}`)
        }
      })

      this.frsSocket.on('localization',(data) => {
        try{
          const json = JSON.parse(data);
          socketLogger.debug(`[COMMAND] FRS Localization: ${JSON.stringify(json)}`);
          if(this.slamnav){
              this.slamnav.emit("localization",stringifyAllValues(json))
          }else{
            this.frsSocket.emit("localizationResponse",{robotSerial:global.robotSerial,data:{...data,result:'fail',message:'SLAMNAV2 disconnected'}});
          }
        }catch(error){
          socketLogger.error(`[COMMAND] FRS Localization: ${JSON.stringify(data)}, ${errorToJson(error)}`)
        }
      })

      this.frsSocket.on('randomseq',(data) => {
        try{
          const json = JSON.parse(data);
          socketLogger.debug(`[COMMAND] FRS randomseq: ${JSON.stringify(json)}`);
          if(this.slamnav){
              this.slamnav.emit("randomseq",stringifyAllValues(json))
          }else{
            this.frsSocket.emit("randomseqResponse",{robotSerial:global.robotSerial,data:{...data,result:'fail',message:'SLAMNAV2 disconnected'}});
          }
        }catch(error){
          socketLogger.error(`[COMMAND] FRS randomseq: ${JSON.stringify(data)}, ${errorToJson(error)}`)
        }
      })

      this.frsSocket.on('mapping',(data) => {
        try{
          const json = JSON.parse(data);
          socketLogger.debug(`[COMMAND] FRS mapping: ${JSON.stringify(json)}`);
          if(this.slamnav){
              this.slamnav.emit("mapping",stringifyAllValues(json))
          }else{
            this.frsSocket.emit("mappingResponse",{robotSerial:global.robotSerial,data:{...data,result:'fail',message:'SLAMNAV2 disconnected'}});
          }
        }catch(error){
          socketLogger.error(`[COMMAND] FRS mapping: ${JSON.stringify(data)}, ${errorToJson(error)}`)
        }
      })

      this.frsSocket.on('dock',(data) => {
        try{
          const json = JSON.parse(data);
          socketLogger.debug(`[COMMAND] FRS dock: ${JSON.stringify(json)}`);
          if(this.slamnav){
              this.slamnav.emit("dock",stringifyAllValues(json))
          }else{
            this.frsSocket.emit("dockResponse",{robotSerial:global.robotSerial,data:{...data,result:'fail',message:'SLAMNAV2 disconnected'}});
          }
        }catch(error){
          socketLogger.error(`[COMMAND] FRS dock: ${JSON.stringify(data)}, ${errorToJson(error)}`)
        }
      })

      this.frsSocket.on('lidarOnOff',(data) => {
        try{
          const json = JSON.parse(data);
          socketLogger.debug(`[COMMAND] FRS lidarOnOff: ${JSON.stringify(json)}`);
          if(this.slamnav){
              this.slamnav.emit("lidarOnOff",stringifyAllValues(json))
          }
        }catch(error){
          socketLogger.error(`[COMMAND] FRS lidarOnOff: ${JSON.stringify(data)}, ${errorToJson(error)}`)
        }
      })

      this.frsSocket.on('pathOnOff',(data) => {
        try{
          const json = JSON.parse(data);
          socketLogger.debug(`[COMMAND] FRS pathOnOff: ${JSON.stringify(json)}`);
          if(this.slamnav){
              this.slamnav.emit("pathOnOff",stringifyAllValues(json))
          }
        }catch(error){
          socketLogger.error(`[COMMAND] FRS pathOnOff: ${JSON.stringify(data)}, ${errorToJson(error)}`)
        }
      })

      this.frsSocket.on('path',(data) => {
        try{
          const json = JSON.parse(data);
          socketLogger.debug(`[COMMAND] FRS path: ${JSON.stringify(json)}`);
          if(this.slamnav){
              this.slamnav.emit("path",stringifyAllValues(json))
          }
        }catch(error){
          socketLogger.error(`[COMMAND] FRS path: ${JSON.stringify(data)}, ${errorToJson(error)}`)
        }
      })
      this.frsSocket.on('vobsRobots',(data) => {
        try{
          const json = JSON.parse(data);
          socketLogger.debug(`[COMMAND] FRS vobsRobots: ${JSON.stringify(json)}`);
          if(this.slamnav){
              this.slamnav.emit("vobsRobots",stringifyAllValues(json))
          }
        }catch(error){
          socketLogger.error(`[COMMAND] FRS vobsRobots: ${JSON.stringify(data)}, ${errorToJson(error)}`)
        }
      })
      this.frsSocket.on('vobsClosures',(data) => {
        try{
          const json = JSON.parse(data);
          socketLogger.debug(`[COMMAND] FRS vobsClosures: ${JSON.stringify(json)}`);
          if(this.slamnav){
              this.slamnav.emit("vobsClosures",stringifyAllValues(json))
          }
        }catch(error){
          socketLogger.error(`[COMMAND] FRS vobsClosures: ${JSON.stringify(data)}, ${errorToJson(error)}`)
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
      // this.taskman.emit('file')
    }
    client.join(client.handshake.query.name);
  }

  // 클라이언트가 연결 해제되면 룸에서 leave 시킬 수 있음
  handleDisconnect(client: Socket) {
    socketLogger.info(`[CONNECT] Client disconnected: Name(${client.handshake.query.name}), IP(${client.handshake.address}), ID(${client.id})`)

    if (client.handshake.query.name == 'slamnav') {
      if (this.moveState.result == 'accept') {
        this.server.emit('moveResponse', {
          robotSerial:global.robotSerial,
          data:{
            ...this.moveState,
            result: 'fail',
            message: 'disconnected',
          }
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
  @SubscribeMessage('taskStart')
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
      this.server.emit('taskStart', payload);
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
      socketLogger.debug(
        `[RESPONSE] Task Done : ${JSON.stringify(payload)}`
      );
      this.server.emit('taskDone', payload);
    } catch (error) {
      socketLogger.error(`[RESPONSE] Task Done: ${errorToJson(error)}`);
    }
  }
  @SubscribeMessage('taskLoad')
  async handleTaskLoadMessage(@MessageBody() payload:TaskPayload){
    try {
      this.taskState.file = payload.file;
      this.taskState.id = payload.id;
      this.taskState.running = payload.running;
      socketLogger.debug(
        `[RESPONSE] Task Load : ${JSON.stringify(payload)}`
      );
      this.server.emit('taskLoad', payload);
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
      socketLogger.debug(
        `[RESPONSE] Task Error : ${JSON.stringify(payload)}`
      );
      this.server.emit('taskError', payload);
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
      socketLogger.debug(`[RESPONSE] Task Id Change : ${JSON.stringify(payload)}`);
      this.taskState.id = payload;
      this.server.emit('taskId', payload);
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
      const json = JSON.parse(JSON.stringify(payload));
      this.server.to('slamnav').emit('move', json);

      socketLogger.debug(
        `[COMMAND] Move: ${JSON.stringify(json)}`,
      );
    } catch (error) {
      socketLogger.error(`[COMMAND] Move: ${errorToJson(error)}`);
      throw error();
    }
  }

  @SubscribeMessage('status')
  async handleStatusMessage(@MessageBody() payload: string){
    const json = JSON.parse(payload);
    this.server.emit('status',json);

    if(this.frsSocket.connected){
        this.frsSocket.emit('status',{robotSerial:global.robotSerial,data:json});
    }

    this.robotState = {...this.robotState,...json};
  }

  @SubscribeMessage('moveStatus')
  async handleWorkingStatusMessage(@MessageBody() payload: string){
    const json = JSON.parse(payload);
    this.server.emit('moveStatus',json);
    if(this.frsSocket.connected){
      this.frsSocket.emit('moveStatus',{robotSerial:global.robotSerial,data:json});
    }
    this.robotState = {...this.robotState,...json};
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

      if(this.frsSocket.connected){
        this.frsSocket.emit('moveResponse',{robotSerial:global.robotSerial,data:json})
      }
      this.moveState = json;

      socketLogger.debug(
        `[RESPONSE] SLAMNAV Move: ${JSON.stringify(json)}`,
      );
    } catch (error) {
      socketLogger.error(`[RESPONSE] SLAMNAV Move: ${errorToJson(error)}`);
      throw error();
    }
  }

  @SubscribeMessage('lidarCloud')
  async handleLidarCloudMessage(@MessageBody() payload:any[]){
    try{
      this.server.emit("lidarCloud",payload);
      if(this.frsSocket.connected){
        this.frsSocket.emit('lidarCloud',{robotSerial:global.robotSerial,data:Payload})
      }
      this.lidarCloud = payload;
    }catch(error){
      socketLogger.error(`[STATUS] Lidar: ${errorToJson(error)}`);
      throw error();
    }
  }

  @SubscribeMessage('mappingCloud')
  async handleMappingCloudMessage(@MessageBody() payload:any[]){
    try{
      this.server.emit("mappingCloud",payload);
    }catch(error){
      socketLogger.error(`[STATUS] Mapping Cloud: ${errorToJson(error)}`);
      throw error();
    }
  }

  @SubscribeMessage('localPath')
  async handleLocalPathdMessage(@MessageBody() payload:any[]){
    try{
      this.server.emit("localPath",payload);
      if(this.frsSocket.connected && global.robotSerial != ""){
        const sendData = {
          robotSerial: global.robotSerial,
          data: payload,
        };
        this.frsSocket.emit("localPath", sendData);
      }
    }catch(error){
      socketLogger.error(`[STATUS] localPath: ${errorToJson(error)}`);
      throw error();
    }
  }
  @SubscribeMessage('globalPath')
  async handleGlobalPathdMessage(@MessageBody() payload:any[]){
    try{
      this.server.emit("globalPath",payload);
      socketLogger.debug(`[STATUS] globalPath: ${JSON.stringify(payload)}`)
      if(this.frsSocket.connected && global.robotSerial != ""){
        const sendData = {
          robotSerial: global.robotSerial,
          data: payload,
        };
        this.frsSocket.emit("globalPath", sendData);
      }
    }catch(error){
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
    @MessageBody() payload: { file: string; id: number; running: boolean},
  ) {
    try {
      this.taskState.file = payload.file;
      this.taskState.id = payload.id;
      this.taskState.running = payload.running;  
      socketLogger.debug(`[INIT] Task Init: ${JSON.stringify(payload)}`);
      this.server.emit('taskInit', this.taskState);
    } catch (error) {
      socketLogger.error(`[INIT] Task Init: ${errorToJson(error)}`);
      throw error();
    }
  }

  @SubscribeMessage('taskVariables')
  async handleTaskVariablesMessage(
    @MessageBody() payload:any[]
  ){
    try {
      this.taskState.variables = payload;
      socketLogger.debug(`[INIT] Task Variables: ${JSON.stringify(payload)}`);
      this.server.emit('taskVariables',payload);
    } catch (error) {
      socketLogger.error(`[INIT] Task Variables:  ${errorToJson(error)}`);
      throw error();
    }
  }

  @SubscribeMessage('taskDock')
  async handleTaskDockMessage(
    @MessageBody() payload:any[]
  ){
    try {
      socketLogger.debug(`[COMMAND] Task Dock`);
      this.slamnav.emit("dock",{command:"dock",time:Date.now().toString()})
    } catch (error) {
      socketLogger.error(`[INIT] Task Dock:  ${errorToJson(error)}`);
      throw error();
    }
  }

  @SubscribeMessage('taskUndock')
  async handleTaskUnDockMessage(
    @MessageBody() payload:any[]
  ){
    try {
      socketLogger.debug(`[COMMAND] Task UnDock`);
      this.slamnav.emit("dock",{command:"undock",time:Date.now().toString()})
    } catch (error) {
      socketLogger.error(`[INIT] Task UnDock:  ${errorToJson(error)}`);
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
