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
exports.OnvifDeviceController = void 0;
const common_1 = require("@nestjs/common");
const onvif_service_1 = require("./onvif.service");
const xml2js = require("xml2js");
const http_status_messages_constants_1 = require("../../../common/constants/http-status-messages.constants");
const http_logger_1 = require("../../../common/logger/http.logger");
const error_util_1 = require("../../../common/util/error.util");
const child_process_1 = require("child_process");
const fs = require("fs");
let OnvifDeviceController = class OnvifDeviceController {
    constructor(OnvifDeviceService) {
        this.OnvifDeviceService = OnvifDeviceService;
    }
    onModuleInit() { }
    async DeviceService(body, req, res) {
        console.log('?');
        const parser = new xml2js.Parser({
            explicitArray: false,
            tagNameProcessors: [xml2js.processors.stripPrefix],
        });
        parser.parseString(body, async (err, result) => {
            if (err) {
                http_logger_1.default.error(`[ONVIF] Request Device Service : Parsing Error -> ${JSON.stringify(body)}, ${(0, error_util_1.errorToJson)(err)}`);
                res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send(http_status_messages_constants_1.HttpStatusMessagesConstants.INVALID_DATA_400);
                return;
            }
            const methodName = Object.keys(result['Envelope']['Body']).find((key) => key !== '$');
            http_logger_1.default.info(`[ONVIF] Request Device Service : ${methodName}, ${JSON.stringify(result)}`);
            let responseXml;
            if (methodName == 'GetSystemDateAndTime') {
                responseXml = await this.OnvifDeviceService.responseSystemDateAndTime();
            }
            else if (methodName == 'GetCapabilities') {
                responseXml = await this.OnvifDeviceService.responseCapabilities(req.socket.remoteAddress);
            }
            else if (methodName == 'SetSystemDateAndTime') {
                responseXml = await this.OnvifDeviceService.setSystemDateAndTime();
            }
            else if (methodName == 'GetServiceCapabilities') {
                responseXml = await this.OnvifDeviceService.responseCapabilities(req.socket.remoteAddress);
            }
            else if (methodName == 'GetServices') {
                responseXml = await this.OnvifDeviceService.responseServices(req.socket.remoteAddress);
            }
            else if (methodName == 'GetDeviceInformation') {
                responseXml = await this.OnvifDeviceService.responseDeviceInformation();
            }
            else if (methodName == 'GetScopes') {
                responseXml = await this.OnvifDeviceService.responseScopes();
            }
            else if (methodName == 'GetNetworkInterfaces') {
                responseXml = await this.OnvifDeviceService.responseNetworkInterfaces(req.socket.remoteAddress);
            }
            else if (methodName == 'GetDNS') {
                responseXml = await this.OnvifDeviceService.responseDNS(req.socket.remoteAddress);
            }
            else if (methodName == 'GetHostname') {
                responseXml = await this.OnvifDeviceService.responseHostname();
            }
            else if (methodName == 'GetNetworkProtocols') {
                responseXml = await this.OnvifDeviceService.responseNetworkProtocols();
            }
            else if (methodName == 'GetDiscoveryMode') {
                responseXml = await this.OnvifDeviceService.responseDiscoveryMode();
            }
            else if (methodName == 'GetNetworkDefaultGateway') {
                responseXml = await this.OnvifDeviceService.responseDefaultGateway(req.socket.remoteAddress);
            }
            else if (methodName == 'GetNTP') {
                responseXml = await this.OnvifDeviceService.responseNTP();
            }
            if (responseXml) {
                res.set('Content-Type', 'application/soap+xml');
                res.send(responseXml);
            }
            else {
                http_logger_1.default.error(`methodName not matching ${methodName}`);
                res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send(http_status_messages_constants_1.HttpStatusMessagesConstants.INVALID_DATA_400);
            }
        });
    }
    async MediaService(body, req, res) {
        console.error('media_service : ', JSON.stringify(body));
        const parser = new xml2js.Parser({
            explicitArray: false,
            tagNameProcessors: [xml2js.processors.stripPrefix],
        });
        parser.parseString(body, async (err, result) => {
            if (err) {
                http_logger_1.default.error(`[ONVIF] Request Media Service : Parsing Error -> ${JSON.stringify(body)}, ${(0, error_util_1.errorToJson)(err)}`);
                res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send(http_status_messages_constants_1.HttpStatusMessagesConstants.INVALID_DATA_400);
                return;
            }
            const methodName = Object.keys(result['Envelope']['Body']).find((key) => key !== '$');
            http_logger_1.default.info(`[ONVIF] Request Media Service : ${methodName}, ${JSON.stringify(result)}`);
            let responseXml;
            if (methodName == 'GetProfiles') {
                responseXml = await this.OnvifDeviceService.responseMediaProfiles();
            }
            else if (methodName == 'GetStreamUri') {
                responseXml = await this.OnvifDeviceService.responseStreamUri(req.socket.remoteAddress);
            }
            else if (methodName == 'GetVideoSources') {
                responseXml = await this.OnvifDeviceService.responseVideoSources();
            }
            else if (methodName == 'GetAudioSources') {
                responseXml = await this.OnvifDeviceService.responseAudioSources();
            }
            else if (methodName == 'GetSnapshotUri') {
                responseXml = await this.OnvifDeviceService.responseSnapshotUri(req.socket.remoteAddress);
            }
            else if (methodName == 'GetProfile') {
                responseXml = await this.OnvifDeviceService.responseMediaProfile();
            }
            else if (methodName == 'GetNodes') {
                console.log('error?!');
            }
            else if (methodName == 'GetVideoSourceConfiguration') {
                responseXml =
                    await this.OnvifDeviceService.responseVideoSourceConfiguration();
            }
            if (responseXml) {
                res.set('Content-Type', 'application/soap+xml');
                res.send(responseXml);
            }
            else {
                http_logger_1.default.error(`methodName not matching ${methodName}`);
                res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send(http_status_messages_constants_1.HttpStatusMessagesConstants.INVALID_DATA_400);
            }
        });
    }
    async getSnapshot(res) {
        http_logger_1.default.info(`[ONVIF] getSnapshot`);
        fs.readFile('/data/snapshot.jpg', (err, data) => {
            if (err) {
                res.status(500).send('Error reading snapshot');
                return;
            }
            http_logger_1.default.info(`[ONVIF] getSnapshot Done`);
            res.setHeader('Content-Type', 'image/jpeg');
            res.send(data);
        });
    }
    async getSnapshot1(res) {
        http_logger_1.default.info(`[ONVIF] getSnapshot`);
        (0, child_process_1.exec)('ffmpeg -y -i rtsp://localhost:8554/cam0 -frames:v 1 snapshot.jpg', (error) => {
            if (error) {
                res.status(500).send('Error capturing snapshot');
                return;
            }
            fs.readFile('snapshot.jpg', (err, data) => {
                if (err) {
                    res.status(500).send('Error reading snapshot');
                    return;
                }
                http_logger_1.default.info(`[ONVIF] getSnapshot Done`);
                res.setHeader('Content-Type', 'image/jpeg');
                res.send(data);
            });
        });
    }
    async PTZService(body, req, res) {
        console.error('ptz_service : ', JSON.stringify(body));
        const parser = new xml2js.Parser({
            explicitArray: false,
            tagNameProcessors: [xml2js.processors.stripPrefix],
        });
        parser.parseString(body, async (err, result) => {
            if (err) {
                http_logger_1.default.error(`[ONVIF] Request Media Service : Parsing Error -> ${JSON.stringify(body)}, ${(0, error_util_1.errorToJson)(err)}`);
                res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send(http_status_messages_constants_1.HttpStatusMessagesConstants.INVALID_DATA_400);
                return;
            }
            const methodName = Object.keys(result['Envelope']['Body']).find((key) => key !== '$');
            http_logger_1.default.info(`[ONVIF] Request PTZ Service : ${methodName}, ${JSON.stringify(result)}`);
            let responseXml;
            if (methodName == 'ContinuousMove') {
                const token = result['Envelope']['Body']['ContinuousMove']['ProfileToken'];
                if (result['Envelope']['Body']['ContinuousMove']['Velocity']['PanTilt']) {
                    const x = result['Envelope']['Body']['ContinuousMove']['Velocity']['PanTilt']['$'].x;
                    const y = result['Envelope']['Body']['ContinuousMove']['Velocity']['PanTilt']['$'].y;
                    http_logger_1.default.info(`[ONVIF] PTZ Move PanTilt : ${token}, Velocity(${x}, ${y})`);
                }
                else if (result['Envelope']['Body']['ContinuousMove']['Velocity']['Zoom']) {
                    const velocity = result['Envelope']['Body']['ContinuousMove']['Velocity']['Zoom']['$'].x;
                    http_logger_1.default.info(`[ONVIF] PTZ Move Zoom : ${token}, Velocity(${velocity})`);
                }
                responseXml = await this.OnvifDeviceService.responsePTZMove('<ptz:ContinuousMoveResponse/>');
            }
            else if (methodName == 'RelativeMove') {
                const token = result['Envelope']['Body']['RelativeMove']['ProfileToken'];
                const pantilt = result['Envelope']['Body']['RelativeMove']['Translation']['PanTilt']?.['$'];
                const zoom = result['Envelope']['Body']['RelativeMove']['Translation']['Zoom']?.['$'];
                const pantilt_vel = result['Envelope']['Body']['RelativeMove']['Speed']?.['PanTilt']?.['$'];
                const zoom_vel = result['Envelope']['Body']['RelativeMove']['Speed']?.['Zoom']?.['$'];
                http_logger_1.default.info(`[ONVIF] PTZ Move RelativeMove : ${token}, PanTilt(${pantilt?.x},${pantilt?.y}), Zoom(${zoom?.x}), PanTiltSpeed(${pantilt_vel?.x},${pantilt_vel?.y}), ZoomSpeed(${zoom_vel?.x})`);
                responseXml = await this.OnvifDeviceService.responsePTZMove('<ptz:RelativeMoveResponse/>');
            }
            else if (methodName == 'AbsoluteMove') {
                const token = result['Envelope']['Body']['AbsoluteMove']['ProfileToken'];
                const pantilt = result['Envelope']['Body']['AbsoluteMove']['Position']['PanTilt']['$'];
                const zoom = result['Envelope']['Body']['AbsoluteMove']['Position']['Zoom']['$'];
                const pantilt_vel = result['Envelope']['Body']['AbsoluteMove']['Speed']?.['PanTilt']?.['$'];
                const zoom_vel = result['Envelope']['Body']['AbsoluteMove']['Speed']?.['Zoom']?.['$'];
                http_logger_1.default.info(`[ONVIF] PTZ Move AbsoluteMove : ${token}, PanTilt(${pantilt.x},${pantilt.y}), Zoom(${zoom.x}), PanTiltSpeed(${pantilt_vel?.x},${pantilt_vel?.y}), ZoomSpeed(${zoom_vel?.x})`);
                responseXml = await this.OnvifDeviceService.responsePTZMove('<ptz:AbsoluteMoveResponse/>');
            }
            else if (methodName == 'Stop') {
                const token = result['Envelope']['Body']['Stop']['ProfileToken'];
                const pantilt = result['Envelope']['Body']['Stop']['PanTilt'];
                const zoom = result['Envelope']['Body']['Stop']['Zoom'];
                http_logger_1.default.info(`[ONVIF] PTZ Move Stop : ${token}, PanTilt(${pantilt}), Zoom(${zoom})`);
                responseXml = await this.OnvifDeviceService.responsePTZMove('<ptz:StopResponse/>');
            }
            else if (methodName == 'GotoHomePosition') {
                const token = result['Envelope']['Body']['GotoHomePosition']['ProfileToken'];
                http_logger_1.default.info(`[ONVIF] PTZ Move GotoHomePosition : ${token}`);
            }
            else if (methodName == 'SetHomePosition') {
                const token = result['Envelope']['Body']['SetHomePosition']['ProfileToken'];
                http_logger_1.default.info(`[ONVIF] PTZ Move SetHomePosition : ${token}`);
            }
            else if (methodName == 'SetPreset') {
                const token = result['Envelope']['Body']['SetPreset']['ProfileToken'];
                const name = result['Envelope']['Body']['SetPreset']['PresetName'];
                http_logger_1.default.info(`[ONVIF] PTZ Move SetPreset : ${token}, ${name}`);
            }
            if (responseXml) {
                res.set('Content-Type', 'application/soap+xml');
                res.send(responseXml);
            }
            else {
                http_logger_1.default.error(`methodName not matching ${methodName}`);
                res
                    .status(common_1.HttpStatus.BAD_REQUEST)
                    .send(http_status_messages_constants_1.HttpStatusMessagesConstants.INVALID_DATA_400);
            }
        });
    }
    async DeviceIOService(body, req, res) {
        console.error('deviceio_service : ', JSON.stringify(body));
        res.set('Content-Type', 'application/soap+xml');
        res.send();
    }
    async EventService(body, req, res) {
        console.error('event_service : ', JSON.stringify(body));
        res.set('Content-Type', 'application/soap+xml');
        res.send();
    }
};
exports.OnvifDeviceController = OnvifDeviceController;
__decorate([
    (0, common_1.Post)('device_service'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: false, forbidNonWhitelisted: false })),
    __param(0, (0, common_1.RawBody)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], OnvifDeviceController.prototype, "DeviceService", null);
__decorate([
    (0, common_1.Post)('media_service'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: false, forbidNonWhitelisted: false })),
    __param(0, (0, common_1.RawBody)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], OnvifDeviceController.prototype, "MediaService", null);
__decorate([
    (0, common_1.Get)('snapshot.jpg'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OnvifDeviceController.prototype, "getSnapshot", null);
__decorate([
    (0, common_1.Get)('snapshot1.jpg'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OnvifDeviceController.prototype, "getSnapshot1", null);
__decorate([
    (0, common_1.Post)('ptz_service'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: false, forbidNonWhitelisted: false })),
    __param(0, (0, common_1.RawBody)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], OnvifDeviceController.prototype, "PTZService", null);
__decorate([
    (0, common_1.Post)('deviceio_service'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: false, forbidNonWhitelisted: false })),
    __param(0, (0, common_1.RawBody)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], OnvifDeviceController.prototype, "DeviceIOService", null);
__decorate([
    (0, common_1.Post)('event_service'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: false, forbidNonWhitelisted: false })),
    __param(0, (0, common_1.RawBody)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], OnvifDeviceController.prototype, "EventService", null);
exports.OnvifDeviceController = OnvifDeviceController = __decorate([
    (0, common_1.Controller)('onvif'),
    __metadata("design:paramtypes", [onvif_service_1.OnvifDeviceService])
], OnvifDeviceController);
//# sourceMappingURL=onvif.controller.js.map