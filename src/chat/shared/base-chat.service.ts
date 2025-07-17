// chat/shared/base-chat.service.ts
import { Injectable, Inject } from '@nestjs/common';
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

 protected async processInbound(data: ChatMessage): Promise<void> {
   const processed = await this.preProcess(data);
   this.gateway.sendToRoom(processed.roomId, processed);
   await this.postProcess(processed);
 }

 protected async processOutbound(data: ChatMessage): Promise<void> {
   const processed = await this.preProcessOutbound(data);
   await this.kafkaService.emit(this.getOutboundTopic(), processed);
   await this.postProcessOutbound(processed);
 }

 // Override in child classes for custom logic
 protected async preProcess(data: ChatMessage): Promise<ChatMessage> {
   return data;
 }

 protected async postProcess(data: ChatMessage): Promise<void> {
   // Override for analytics, logging, etc.
 }

 protected async preProcessOutbound(data: ChatMessage): Promise<ChatMessage> {
   return data;
 }

 protected async postProcessOutbound(data: ChatMessage): Promise<void> {
   // Override for logging, etc.
 }

 protected abstract getOutboundTopic(): string;
}