import { Injectable } from '@nestjs/common';
import socketLogger from '@common/logger/socket.logger';
import { Consumer, Kafka } from 'kafkajs';
import { UploadService } from 'src/modules/apis/upload/upload.service';

@Injectable()
export class KafkaClientService {
  private kafka: Kafka = null;
  private client: Consumer = null;

  constructor(private readonly uploadService: UploadService) {}

  async connect() {
    global.kafkaConnect = false;
    // global.kafka_url = "kafka://10.108.1.180:9092"
    socketLogger.info(`[KAFKA] Try to connect KAFKA : ${global.kafka_url}`);
    this.kafka = new Kafka({
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
          socketLogger.info(
            `[KAFKA] New Message : ${topic.toString()}, ${JSON.stringify(message.value.toString())}`,
          );
          if (topic == 'frs-map-publish_' + global.robotSerial) {
            this.mapPublish(JSON.parse(message.value.toString()));
          }
        },
      });
    } catch (error) {
      socketLogger.error(`[KAFKA] ${error.name}: ${error.message}`);
    }
  }

  async mapPublish(data: any) {
    const fileName = data.attachmentFileDtlFlNm;
    if (fileName != '') {
      socketLogger.info(`[KAFKA] mapPublish: ${fileName}`);
      await this.uploadService.downloadMap(fileName);
      socketLogger.info(`[KAFKA] mapPublish Success Done`);
    } else {
      socketLogger.error(
        `[KAFKA] mapPublish: attachmentFileDtlFlNm is undefined(${fileName})`,
      );
    }
  }
}
