export declare class MqttClientService {
    private client;
    connect(): void;
    publish(topic: string, message: string): void;
    subscribe(topic: string): void;
}
