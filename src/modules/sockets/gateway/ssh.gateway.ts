import { Global, Injectable, OnModuleInit } from '@nestjs/common';
import { Server } from 'socket.io';
import * as ssh2 from 'ssh2';
import * as fs from 'fs';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import socketLogger from '@common/logger/socket.logger';
import { errorToJson } from '@common/util/error.util';

@Global()
@WebSocketGateway(11339,{
  transports:['websocket','polling'],
  cors:{
    origin:"*",
    credentials:true
  },
  host:"0.0.0.0"
})
export class SSHGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;
  clients: Map<string, any> = new Map();
  connection: { [key: string]: ssh2.Client } = {};
  shell: { [key: string]: ssh2.Client } = {};
  stream: { [key: string]: NodeJS.ReadableStream } = {};
  conectado: { [key: string]: boolean } = {};

  // Socket.IO 서버 초기화
  onModuleInit() {
    socketLogger.info(`[SSH] Server Opened 11339`)
  }

  // 클라이언트와의 연결 처리
  handleConnection(socket: any) {
    socketLogger.info(`[SSH] Client Connected : #{socket.id}`)
    console.log('New client connected : ',socket.id);

    // 연결된 클라이언트를 Map에 저장
    this.clients.set(socket.id, { socket, connection: null, shell: null });

    // 클라이언트에서 메시지 받기
    socket.on('message', (message: string) => {
        console.log("Message : ",message)
      this.handleMessage(socket, message);
    });

    // 연결 종료 처리
    socket.on('disconnect', () => {
      this.handleDisconnect(socket);
    });

    // 오류 처리
    socket.on('error', (err) => {
      console.error('Socket.IO error:', err);
    });
  }

  // 클라이언트로부터 받은 메시지 처리
  handleMessage(socket: any, message: string) {
    const data = JSON.parse(message);
    switch (Object.keys(data)[0]) {
      case 'auth':
        this.handleAuth(socket, data.auth);
        break;
      case 'data':
        this.handleShellData(socket, data.data.data);
        break;
      default:
        console.log('Unknown message type:', Object.keys(data)[0]);
        break;
    }
  }

  // SSH 인증 처리
  handleAuth(socket: any, authData: any) {
    try{
        const { server, port, user, password, key } = authData;
        console.log('handleAuth:', server, port, user, password, key, socket.id);
    
        const conn = new ssh2.Client();
        this.connection[socket.id] = conn;
        this.connection[socket.id].on('ready', () => {
          console.log('SSH connection established ',socket.id);
          this.shell[socket.id] = conn.shell({ term: 'xterm', cols: 80, rows: 24 }, (err, stream) => {
            if (err) {
              console.error('Error starting SSH shell:', err);
              socket.emit('message', 'Failed to start SSH shell');
              return;
            }
            console.log('SSH shell established ',socket.id);
    
            // 클라이언트에 연결된 shell stream 저장
            this.clients.set(socket.id, { ...this.clients.get(socket.id), connection: conn, shell: stream });
    
            stream.on('data', (data: Buffer) => {
                socket.emit('data', data.toString());
            });
    
            socket.emit('message', 'SSH connected');
          });
        }).on('error', (err) => {
          console.error('SSH connection error:', err);
          socket.emit('message', 'SSH connection failed');
        }).connect({
          host: server,
          port: port || 22,
          username: user,
          password: password || '',
          privateKey: key ? fs.readFileSync(key) : undefined,
        });
    }catch(error){
        socketLogger.error(`[SSH] AuthHandler : ${errorToJson(error)}`)
    }
  }

  // 클라이언트의 데이터를 SSH 쉘에 전달
  handleShellData(socket: any, data: string) {   
    try{

    }catch(error){
        socketLogger.error(`[SSH] DataHandler : ${errorToJson(error)}`)
    } 
    const clientData = this.clients.get(socket.id);
    if (clientData && clientData.shell) {
      clientData.shell.write(data);  // Write to the SSH shell stream
    } else {
      console.log('No shell found for the client');
    }
  }

  // 클라이언트 연결 종료 처리
  handleDisconnect(socket: any) {
    console.log('Client disconnected');
    const clientData = this.clients.get(socket.id);
    if (clientData && clientData.shell) {
      clientData.shell.end();
    }
    this.clients.delete(socket.id);
  }
}












