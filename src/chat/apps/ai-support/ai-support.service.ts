/* eslint-disable @typescript-eslint/require-await */
// apps/ai-support-chat/ai-support-chat.service.ts
import { Injectable } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { BaseChatService } from '../../shared/base/base-chat.service';
import { ChatMessage } from '../../../common/configs/types';
import { AiSupportChatGateway } from './ai-support.gateway';
import { KafkaService } from '../../../common/kafka/kafka.service';

@Injectable()
export class AiSupportChatService extends BaseChatService {
  constructor(gateway: AiSupportChatGateway, kafkaService: KafkaService) {
    super(gateway, kafkaService);
  }

  @EventPattern('ai-support-chat-in')
  async handleChatIn(data: ChatMessage): Promise<void> {
    try {
      // AI Support specific processing
      const processedMessage = await this.processMessage(data);
      await this.sendMessage(processedMessage);
    } catch (error) {
      console.error('[AI-SUPPORT] Error handling message:', error);
      // Send error to monitoring - won't affect other services
    }
  }

  getKafkaTopic(): string {
    return 'ai-support-chat-out';
  }

  getServiceName(): string {
    return 'ai-support-chat';
  }

  // AI Support specific message processing
  protected async processMessage(data: ChatMessage): Promise<ChatMessage> {
    return data;
  }
}
