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
exports.KafkaClientService = void 0;
const common_1 = require("@nestjs/common");
const socket_logger_1 = require("../../../common/logger/socket.logger");
const kafkajs_1 = require("kafkajs");
const upload_service_1 = require("../../apis/upload/upload.service");
let KafkaClientService = class KafkaClientService {
    constructor(uploadService) {
        this.uploadService = uploadService;
        this.kafka = null;
        this.client = null;
    }
    async connect() {
        global.kafkaConnect = false;
        socket_logger_1.default.info(`[KAFKA] Try to connect KAFKA : ${global.kafka_url}`);
        this.kafka = new kafkajs_1.Kafka({
            brokers: [global.kafka_url],
        });
        this.client = this.kafka.consumer({ groupId: 'frs-kafka' });
        try {
            await this.client.connect();
            global.kafkaConnect = true;
            await this.client.subscribe({
                topic: 'frs-map-publish_' + global.robotSerial,
                fromBeginning: true,
            });
            await this.client.run({
                eachMessage: async ({ topic, message }) => {
                    socket_logger_1.default.info(`[KAFKA] New Message : ${topic.toString()}, ${JSON.stringify(message.value.toString())}`);
                    if (topic == 'frs-map-publish_' + global.robotSerial) {
                        this.mapPublish(JSON.parse(message.value.toString()));
                    }
                },
            });
        }
        catch (error) {
            socket_logger_1.default.error(`[KAFKA] ${error.name}: ${error.message}`);
        }
    }
    async mapPublish(data) {
        const fileName = data.attachmentFileDtlFlNm;
        if (fileName != '') {
            socket_logger_1.default.info(`[KAFKA] mapPublish: ${fileName}`);
            await this.uploadService.downloadMap(fileName);
            socket_logger_1.default.info(`[KAFKA] mapPublish Success Done`);
        }
        else {
            socket_logger_1.default.error(`[KAFKA] mapPublish: attachmentFileDtlFlNm is undefined(${fileName})`);
        }
    }
};
exports.KafkaClientService = KafkaClientService;
exports.KafkaClientService = KafkaClientService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [upload_service_1.UploadService])
], KafkaClientService);
//# sourceMappingURL=kafka.service.js.map