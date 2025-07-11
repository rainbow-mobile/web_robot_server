"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttClientService = void 0;
const common_1 = require("@nestjs/common");
const socket_logger_1 = require("../../../common/logger/socket.logger");
const mqtt = require("mqtt");
const error_util_1 = require("../../../common/util/error.util");
let MqttClientService = class MqttClientService {
    constructor() {
        this.client = null;
    }
    connect() {
        global.mqttConnect = false;
        socket_logger_1.default.info(`[MQTT] Try to connect Mqtt : ${global.mqtt_url}`);
        this.client = mqtt.connect(global.mqtt_url, {
            username: 'rainbow',
            password: 'rainbow',
        });
        this.client.on('connect', () => {
            socket_logger_1.default.info(`[MQTT] Connected Mqtt `);
            global.mqttConnect = true;
            this.subscribe('test/' + global.robotSerial);
        });
        this.client.on('disconnect', () => {
            global.mqttConnect = false;
            socket_logger_1.default.warn(`[MQTT] Disconnected Mqtt`);
        });
        this.client.on('error', (error) => {
            socket_logger_1.default.error(`[MQTT] Error: ${(0, error_util_1.errorToJson)(error)}`);
        });
        this.client.on('message', (topic, message) => {
            try {
                const json = JSON.parse(message);
                socket_logger_1.default.info(`[MQTT] Message ${topic}: ${JSON.stringify(json)}`);
            }
            catch (error) {
                socket_logger_1.default.error(`[MQTT] got Message: ${(0, error_util_1.errorToJson)(error)}`);
            }
        });
    }
    publish(topic, message) {
        try {
            if (this.client) {
                this.client.publish(topic, message, { qos: 2 }, (err) => {
                    if (err) {
                        socket_logger_1.default.error(`[MQTT] Publish ${topic}: ${JSON.stringify(message)}, ${(0, error_util_1.errorToJson)(err)}`);
                    }
                    else {
                        socket_logger_1.default.info(`[MQTT] Message published to topic ${topic}`);
                    }
                });
            }
            else {
                socket_logger_1.default.error(`[MQTT] Publish ${topic}: Mqtt not connected`);
            }
        }
        catch (error) {
            socket_logger_1.default.error(`[MQTT] Publish ${topic}:${(0, error_util_1.errorToJson)(error)}`);
        }
    }
    subscribe(topic) {
        try {
            if (this.client) {
                this.client.subscribe(topic, { qos: 2 }, (err) => {
                    if (err) {
                        socket_logger_1.default.error(`[MQTT] Subscribe ${topic}: ${JSON.stringify(err)}`);
                    }
                    else {
                        socket_logger_1.default.info(`[MQTT] Subscribed to topic ${topic}`);
                    }
                });
            }
            else {
                socket_logger_1.default.error(`[MQTT] Subscribe ${topic}: Mqtt not connected`);
            }
        }
        catch (error) {
            socket_logger_1.default.error(`[MQTT] Subscribe ${topic}:${(0, error_util_1.errorToJson)(error)}`);
        }
    }
};
exports.MqttClientService = MqttClientService;
exports.MqttClientService = MqttClientService = __decorate([
    (0, common_1.Injectable)()
], MqttClientService);
