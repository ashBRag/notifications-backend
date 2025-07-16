import { Injectable } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';

@Injectable()
export class KafkaService {
 private client: Kafka;
 private producer: Producer;
 private consumer: Consumer;

 async connect() {
   this.client = new Kafka({
     clientId: 'notifications-service',
     brokers: [process.env.KAFKA_BROKER as string]
   });
   this.producer = this.client.producer();
   await this.producer.connect();
 }

 async emit(topic: string, message: any) {
   await this.producer.send({
     topic,
     messages: [{ value: JSON.stringify(message) }]
   });
 }

 async createConsumer(groupId: string) {
   this.consumer = this.client.consumer({ groupId });
   await this.consumer.connect();
   return this.consumer;
 }
};