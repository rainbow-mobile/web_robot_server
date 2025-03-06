// import { Injectable } from '@nestjs/common';
// import { Server, WebSocket } from 'ws';
// import { OnModuleInit } from '@nestjs/common';
// import * as ssh2 from 'ssh2';
// import * as fs from 'fs';

// @Injectable()
// export class SSHGateway implements OnModuleInit {
//   private wss: Server;
//   private clients: Map<string, any> = new Map();
//   private connection: { [key: string]: ssh2.Client } = {};
//   private shell: { [key: string]: ssh2.Client } = {};
//   private stream: { [key: string]: NodeJS.ReadableStream } = {};
//   private conectado: { [key: string]: boolean } = {};

//   // WebSocket 서버 초기화
//   onModuleInit() {
//     this.wss = new Server({ port: 8888 }); // WebSocket 서버를 3001 포트에서 실행
//     this.wss.on('connection', this.handleConnection.bind(this));
//     console.log('WebSocket server started on ws://localhost:8888');
//   }

//   // WebSocket 연결 처리
//   handleConnection(ws: WebSocket) {
//     console.log('New client connected');

//     // 연결된 클라이언트를 Map에 저장
//     this.clients.set(ws['id'], { ws, connection: null, shell: null });

//     // 클라이언트에서 메시지 받기
//     ws.on('message', (message: string) => {
//       this.handleMessage(ws, message);
//     });

//     // 연결 종료 처리
//     ws.on('close', () => {
//       this.handleDisconnect(ws);
//     });

//     // 오류 처리
//     ws.on('error', (err) => {
//       console.error('WebSocket error:', err);
//     });
//   }

//   // 클라이언트로부터 받은 메시지 처리
//   handleMessage(ws: WebSocket, message: string) {
//     const data = JSON.parse(message);

//     console.log(Object.keys(data)[0]);
//     switch (Object.keys(data)[0]) {
//       case 'auth':
//         this.handleAuth(ws, data.auth);
//         break;
//       case 'data':
//         this.handleShellData(ws, data.data);
//         break;
//       case 'resize':
//         this.handleResize(ws, data.resize);
//         break;
//       default:
//         console.log('Unknown message type :',Object.keys(data)[0]);
//         break;
//     }
//   }

//   // SSH 인증 처리
//   handleAuth(ws: WebSocket, authData: any) {
//     const { server, port, user, password, key } = authData;
//     console.log("handleAuth : ", server,port, user, password, key,ws);

//     const conn = new ssh2.Client();
//     this.connection[ws['id']] = conn;
//     this.connection[ws['id']].on('ready', () => {
//       console.log('SSH connection established');
//       this.shell[ws['id']] = conn.shell({term:'xterm',cols:80, rows:24},(err, stream) => {
//         if (err) {
//           console.error('Error starting SSH shell:', err);
//           ws.send('Failed to start SSH shell');
//           return;
//         }

//         // 클라이언트에 연결된 shell stream 저장
//         this.clients.set(ws['id'], { ...this.clients.get(ws['id']), connection: conn, shell: stream });

//         stream.on('data', (data: Buffer) => {
//           ws.send(JSON.stringify(data.toString()));
//         });

//         ws.on('message', (data: string) => {
//           stream.write(data);
//         });

//         ws.send('SSH connected'.toString());
//       });
//     }).on('error', (err) => {
//       console.error('SSH connection error:', err);
//       ws.send('SSH connection failed');
//     }).connect({
//       host: server,
//       port: port || 22,
//       username: user,
//       password: password || '',
//       privateKey: key ? fs.readFileSync(key) : undefined,
//     });
//   }

//   // 클라이언트의 데이터를 SSH 쉘에 전달
//   handleShellData(ws: WebSocket, data: string) {
//     console.log("?????????????????????????",ws)
//     const clientData = this.shell[ws['id']];
//     if (clientData) {
//       clientData.write(data);
//     }else{
//         console.log('shell noting')
//     }
//   }

//   // 터미널 크기 변경 처리
//   handleResize(ws: WebSocket, resizeData: any) {
//     const { cols, rows } = resizeData;
//     const clientData = this.clients.get(ws['id']);
//     if (clientData && clientData.shell) {
//       clientData.shell.resize(cols, rows);
//     }
//   }

//   // 클라이언트 연결 종료 처리
//   handleDisconnect(ws: WebSocket) {
//     console.log('Client disconnected');
//     const clientData = this.clients.get(ws['id']);
//     if (clientData && clientData.shell) {
//       clientData.shell.end();
//     }
//     this.clients.delete(ws['id']);
//   }
// }





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
    // this.io = new Server(8888,{cors:{origin:"*"}}); // Socket.IO 서버를 8888 포트에서 실행

    console.log('Socket.IO server started on ws://localhost:8888');
  }

  // 클라이언트와의 연결 처리
  handleConnection(socket: any) {
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
      case 'resize':
        this.handleResize(socket, data.resize);
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

  // 터미널 크기 변경 처리
  handleResize(socket: any, resizeData: any) {
    try{
        const { cols, rows } = resizeData;

        // Escape sequence for resizing terminal (xterm compatible)
        const resizeSequence = `\x1b[${rows};${cols}t`;

        console.log(resizeData, cols, rows, resizeSequence);
        const clientData = this.clients.get(socket.id);
        if (clientData && clientData.shell) {
          clientData.shell.write(resizeSequence);
        }
    }catch(error){
        socketLogger.error(`[SSH] ResizeHandler : ${errorToJson(error)}`)
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












