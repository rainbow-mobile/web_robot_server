import socketLogger from '@common/logger/socket.logger';
import { errorToJson } from '@common/util/error.util';
import { Injectable } from '@nestjs/common';
import * as net from 'net';

@Injectable()
export class TcpServerService {
    private port = 11338;
    private server = null;

    start(){
        this.server = net.createServer((socket) => {
            socketLogger.info(`[NETWORK] TCP Client Connected : ${socket.remoteAddress}`);
          
            // 클라이언트로부터 데이터 수신
            socket.on('data', (data) => {
                socketLogger.info(`[NETWORK] TCP Data in : ${data.toString()}`);
          
                socket.write('hi');
                // // 클라이언트에 응답 전송
                // socket.write(`서버 응답: ${data}`);
            });
          
            // 클라이언트 연결 종료 처리
            socket.on('end', () => {
                socketLogger.info(`[NETWORK] TCP Client Disconnected`);
            });
          
            // 에러 처리
            socket.on('error', (err) => {
                socketLogger.error(`[NETWORK TCP Server Error : ${errorToJson(err)}]`);
            });
        });

        // 서버 시작
        this.server.listen(this.port, '0.0.0.0', () => {
            socketLogger.info(`[NETWORK] TCP Server listen : ${this.port}`)
        });
        
        // 서버 에러 처리
        this.server.on('error', (err) => {
            socketLogger.error(`[NETWORK] TCP Server error : ${errorToJson(err)}`)

        });
        
    }
}