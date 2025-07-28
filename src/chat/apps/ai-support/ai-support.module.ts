// apps/ai-support-chat/ai-support-chat.module.ts
import { Module } from '@nestjs/common';
import { AiSupportChatService } from './ai-support.service';
import { AiSupportChatGateway } from './ai-support.gateway';
import { KafkaService } from '../../../common/kafka/kafka.service';

@Module({
  providers: [KafkaService, AiSupportChatService, AiSupportChatGateway],
  exports: [AiSupportChatService, AiSupportChatGateway],
})
export class AiSupportChatModule {}
