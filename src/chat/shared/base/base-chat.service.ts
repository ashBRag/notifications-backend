/* eslint-disable @typescript-eslint/require-await */
// shared/base/base-chat.service.ts
import { Injectable } from '@nestjs/common';
import { KafkaService } from '../../../common/kafka/kafka.service';
import { ChatMessage } from '../../../common/configs/types';
import { IChatGateway } from '../interfaces/base-gateway.interface';

@Injectable()
export abstract class BaseChatService {
  constructor(
    protected gateway: IChatGateway,
    protected kafkaService: KafkaService,
  ) {}

  abstract getKafkaTopic(): string;
  abstract getServiceName(): string;

  async sendMessage(data: ChatMessage): Promise<void> {
    try {
      // Send via WebSocket
      console.log('send message', data)
      if (data.roomId) {
        this.gateway.sendToRoom(data.roomId, data);
      } else {
        this.gateway.sendToClients(data);
      }

      // Publish to Kafka
      await this.kafkaService.emit(this.getKafkaTopic(), {
        ...data,
        service: this.getServiceName(),
        processedAt: Date.now(),
      });

      console.log(`[${this.getServiceName()}] Message sent successfully`);
    } catch (error) {
      console.error(`[${this.getServiceName()}] Error sending message:`, error);
      throw error;
    }
  }

  // Optional: Service-specific message processing
  protected async processMessage(data: ChatMessage): Promise<ChatMessage> {
    return data; // Override in child classes for custom processing
  }
}
