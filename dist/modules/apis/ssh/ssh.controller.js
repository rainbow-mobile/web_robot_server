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
exports.SSHController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const http_status_messages_constants_1 = require("../../../common/constants/http-status-messages.constants");
const ssh_service_1 = require("./ssh.service");
const sockets_gateway_1 = require("../../sockets/gateway/sockets.gateway");
const ssh2_1 = require("ssh2");
const command_dto_1 = require("./dto/command.dto");
let SSHController = class SSHController {
    constructor(socketGateway) {
        this.socketGateway = socketGateway;
    }
    async sshConnect(host, res) {
        try {
            this.conn = new ssh2_1.Client();
            this.conn
                .on('ready', () => {
                console.log('SSH 연결 완료');
            })
                .connect({
                host: host,
                port: 22,
                username: 'rainbow',
                password: 'rainbow',
            });
        }
        catch (error) {
            console.error(error);
        }
    }
    async sshCommand(host, data, res) {
        try {
            console.log('COMMAND : ', data.command);
            this.conn = new ssh2_1.Client();
            this.conn
                .on('ready', () => {
                this.conn.exec(data.command, (err, stream) => {
                    if (err)
                        throw err;
                    stream.on('close', () => {
                        console.log('✅ 명령 실행 완료');
                        res.end();
                        this.conn.end();
                    });
                    stream.on('data', (data) => {
                        console.log('STDOUT:', data.toString());
                        res.write(data.toString());
                    });
                    stream.stderr.on('data', (data) => {
                        console.log('STDERR:', data.toString());
                        res.write(data.toString());
                    });
                });
            })
                .connect({
                host: host,
                port: 22,
                username: 'rainbow',
                password: 'rainbow',
            });
        }
        catch (error) {
            console.error(error);
            res
                .status(common_1.HttpStatus.INTERNAL_SERVER_ERROR)
                .send(http_status_messages_constants_1.HttpStatusMessagesConstants.INTERNAL_SERVER_ERROR_500);
        }
    }
};
exports.SSHController = SSHController;
__decorate([
    (0, common_1.Inject)(),
    __metadata("design:type", ssh_service_1.SSHService)
], SSHController.prototype, "taskService", void 0);
__decorate([
    (0, common_1.Get)(':host'),
    __param(0, (0, common_1.Param)('host')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SSHController.prototype, "sshConnect", null);
__decorate([
    (0, common_1.Post)(':host'),
    __param(0, (0, common_1.Param)('host')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, command_dto_1.CommandDto, Object]),
    __metadata("design:returntype", Promise)
], SSHController.prototype, "sshCommand", null);
exports.SSHController = SSHController = __decorate([
    (0, swagger_1.ApiTags)('SSH 관련 API (ssh)'),
    (0, common_1.Controller)('ssh'),
    __metadata("design:paramtypes", [sockets_gateway_1.SocketGateway])
], SSHController);
