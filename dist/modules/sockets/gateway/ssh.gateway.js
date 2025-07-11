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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSHGateway = void 0;
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const ssh2 = require("ssh2");
const fs = require("fs");
const websockets_1 = require("@nestjs/websockets");
const socket_logger_1 = require("../../../common/logger/socket.logger");
const error_util_1 = require("../../../common/util/error.util");
let SSHGateway = class SSHGateway {
    constructor() {
        this.clients = new Map();
        this.connection = {};
        this.shell = {};
        this.stream = {};
        this.conectado = {};
    }
    onModuleInit() {
        socket_logger_1.default.info(`[SSH] Server Opened 11339`);
    }
    handleConnection(socket) {
        socket_logger_1.default.info(`[SSH] Client Connected : #{socket.id}`);
        console.log('New client connected : ', socket.id);
        this.clients.set(socket.id, { socket, connection: null, shell: null });
        socket.on('message', (message) => {
            console.log('Message : ', message);
            this.handleMessage(socket, message);
        });
        socket.on('disconnect', () => {
            this.handleDisconnect(socket);
        });
        socket.on('error', (err) => {
            console.error('Socket.IO error:', err);
        });
    }
    handleMessage(socket, message) {
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
    handleAuth(socket, authData) {
        try {
            const { server, port, user, password, key } = authData;
            console.log('handleAuth:', server, port, user, password, key, socket.id);
            const conn = new ssh2.Client();
            this.connection[socket.id] = conn;
            this.connection[socket.id]
                .on('ready', () => {
                console.log('SSH connection established ', socket.id);
                this.shell[socket.id] = conn.shell({ term: 'xterm', cols: 80, rows: 24 }, (err, stream) => {
                    if (err) {
                        console.error('Error starting SSH shell:', err);
                        socket.emit('message', 'Failed to start SSH shell');
                        return;
                    }
                    console.log('SSH shell established ', socket.id);
                    this.clients.set(socket.id, {
                        ...this.clients.get(socket.id),
                        connection: conn,
                        shell: stream,
                    });
                    stream.on('data', (data) => {
                        socket.emit('data', data.toString());
                    });
                    socket.emit('message', 'SSH connected');
                });
            })
                .on('error', (err) => {
                console.error('SSH connection error:', err);
                socket.emit('message', 'SSH connection failed');
            })
                .connect({
                host: server,
                port: port || 22,
                username: user,
                password: password || '',
                privateKey: key ? fs.readFileSync(key) : undefined,
            });
        }
        catch (error) {
            socket_logger_1.default.error(`[SSH] AuthHandler : ${(0, error_util_1.errorToJson)(error)}`);
        }
    }
    handleShellData(socket, data) {
        try {
        }
        catch (error) {
            socket_logger_1.default.error(`[SSH] DataHandler : ${(0, error_util_1.errorToJson)(error)}`);
        }
        const clientData = this.clients.get(socket.id);
        if (clientData && clientData.shell) {
            clientData.shell.write(data);
        }
        else {
            console.log('No shell found for the client');
        }
    }
    handleDisconnect(socket) {
        console.log('Client disconnected');
        const clientData = this.clients.get(socket.id);
        if (clientData && clientData.shell) {
            clientData.shell.end();
        }
        this.clients.delete(socket.id);
    }
};
exports.SSHGateway = SSHGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SSHGateway.prototype, "server", void 0);
exports.SSHGateway = SSHGateway = __decorate([
    (0, common_1.Global)(),
    (0, websockets_1.WebSocketGateway)(11339, {
        transports: ['websocket', 'polling'],
        cors: {
            origin: '*',
            credentials: true,
        },
        host: '0.0.0.0',
    })
], SSHGateway);
