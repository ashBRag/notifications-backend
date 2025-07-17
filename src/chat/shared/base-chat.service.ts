// chat/shared/base-chat.service.ts
import { Injectable, Inject, Get } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { ChatGateway } from './chat.gateway';
import { KafkaService } from '../../common/kafka/kafka.service';
import { ChatMessage } from '../../common/configs/types';

@Injectable()
export abstract class BaseChatService {
 constructor(
   @Inject(ChatGateway) protected gateway: ChatGateway,
   @Inject(KafkaService) protected kafkaService: KafkaService,
 ) {}

 @Get('/health')
 healthCheck() {
   return { 
     status: 'ok', 
     service: this.constructor.name,
     timestamp: new Date().toISOString()
   };
 }

 // Consume from Kafka -> send to WebSocket clients
 @EventPattern('chat.message')
 protected async sendMessage(data: ChatMessage): Promise<void> {
   const processed = await this.preProcessSend(data);
   this.gateway.sendToRoom(processed.roomId, processed);
   await this.postProcessSend(processed);
 }

 // Receive from WebSocket -> publish to Kafka
 protected async receiveMessage(data: ChatMessage): Promise<void> {
   const processed = await this.preProcessReceive(data);
   await this.kafkaService.emit(this.getKafkaTopic(), processed);
   await this.postProcessReceive(processed);
 }

 // Override for custom logic
 protected async preProcessSend(data: ChatMessage): Promise<ChatMessage> {
   return data;
 }

 protected async postProcessSend(data: ChatMessage): Promise<void> {}

 protected async preProcessReceive(data: ChatMessage): Promise<ChatMessage> {
   return data;
 }

 protected async postProcessReceive(data: ChatMessage): Promise<void> {}

 protected abstract getKafkaTopic(): string;
}