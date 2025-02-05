import { Injectable } from '@nestjs/common';
import socketLogger from '@common/logger/socket.logger';
import * as mqtt from 'mqtt';
import { errorToJson } from '@common/util/error.util';

@Injectable()
export class MqttClientService {
  private client = null;

  connect(){
    global.mqttConnect = false;
    socketLogger.info(`[MQTT] Try to connect Mqtt : ${global.mqtt_url}`)
    this.client = mqtt.connect(global.mqtt_url, {
      username: 'rainbow',
      password: 'rainbow',
    });

    this.client.on('connect', () => {
        socketLogger.info(`[MQTT] Connected Mqtt `);
        global.mqttConnect = true;
        this.subscribe('test/'+global.robotSerial);
    });

    this.client.on('disconnect',() => {
      global.mqttConnect = false;
      socketLogger.warn(`[MQTT] Disconnected Mqtt`);
    })

    this.client.on('error', (error) => {
        socketLogger.error(`[MQTT] Error: ${errorToJson(error)}`);
    })

    this.client.on('message', (topic:string, message:any) => {
        try{
            const json = JSON.parse(message);
          socketLogger.info(`[MQTT] Message ${topic}: ${JSON.stringify(json)}`);
        }catch(error){
            socketLogger.error(`[MQTT] got Message: ${errorToJson(error)}`);
        }
    });
  }

  publish(topic: string, message: string) {
    try{
        if(this.client){
            this.client.publish(topic, message, { qos: 2 }, (err) => {
              if (err) {
                socketLogger.error(`[MQTT] Publish ${topic}: ${JSON.stringify(message)}, ${errorToJson(err)}`);
              } else {
                socketLogger.info(`[MQTT] Message published to topic ${topic}`);
              }
            });
        }else{
            socketLogger.error(`[MQTT] Publish ${topic}: Mqtt not connected`)
        }
    }catch(error){
        socketLogger.error(`[MQTT] Publish ${topic}:${errorToJson(error)}`)
    }
  }

  subscribe(topic: string) {
    try{
        if(this.client){
            this.client.subscribe(topic, { qos: 2 }, (err) => {
            if (err) {
                socketLogger.error(`[MQTT] Subscribe ${topic}: ${JSON.stringify(err)}`);
            } else {
                socketLogger.info(`[MQTT] Subscribed to topic ${topic}`);
            }
            });
        }else{
            socketLogger.error(`[MQTT] Subscribe ${topic}: Mqtt not connected`)
        }
    }catch(error){
        socketLogger.error(`[MQTT] Subscribe ${topic}:${errorToJson(error)}`)
    }
  }
}
