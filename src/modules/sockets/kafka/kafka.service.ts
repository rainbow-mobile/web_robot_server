import { Injectable } from '@nestjs/common';
import socketLogger from '@common/logger/socket.logger';
import * as mqtt from 'mqtt';
import {Consumer, Kafka} from 'kafkajs';
import { Transport } from '@nestjs/microservices';
import { errorToJson } from '@common/util/error.util';

@Injectable()
export class KafkaClientService {
  private kafka:Kafka = null;
  private client:Consumer = null;

  async connect(){
    global.kafka_url = "10.108.1.180:9092"
    socketLogger.info(`[KAFKA] Try to connect KAFKA : ${global.kafka_url}`)
    this.kafka = new Kafka({
        brokers:[global.kafka_url],
    })
    this.client = this.kafka.consumer({groupId:'frs-kafka'});

    await this.client.connect();
    await this.client.subscribe({topic:'kafka-emit1', fromBeginning:true})

    await this.client.run({
    eachMessage: async ({ topic, partition, message }) => {
        console.log({
            topic: topic.toString(),
            partition: partition.toString(),
            key: message.key.toString(),
            value: message.value.toString(),
            header: message.headers.toString()
        });
    },
  });
  }
}
