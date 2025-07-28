/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  SubscribeMessage,
  WebSocketGateway,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { BaseChatGateway } from '../../shared/base/base-chat.gateway';
import { Socket } from 'socket.io';
import { AiSupportChatService } from './ai-support.service';
import { forwardRef, Inject } from '@nestjs/common';

@WebSocketGateway({
  port: 8000,
  namespace: '/ai-support',
  cors: {
    origin: process.env.AI_SUPPORT_ORIGINS?.split(',') || [
      'http://localhost:3000',
    ],
    credentials: true,
  },
  transports: ['websocket'], // Optimized for high throughput
  pingTimeout: 60000,
  maxHttpBufferSize: 1e8, // Allow large files for AI support
})
export class AiSupportChatGateway extends BaseChatGateway {
  constructor(
    @Inject(forwardRef(() => AiSupportChatService))
    private readonly aiSupportService: AiSupportChatService,
  ) {
    super();
  }
  getServiceName(): string {
    return 'ai-support-chat';
  }

  getGatewayConfig(): any {
    return {
      port: 3001,
      namespace: '/ai-support',
      optimizedForHighLoad: true,
    };
  }

  // AI Support specific logic
  protected onClientConnect(client: Socket): void {
    // AI-specific connection logic
    client.emit('ai-support-ready', {
      features: ['file-upload', 'screen-share', 'priority-support'],
      queuePosition: this.getQueuePosition(),
    });
  }

  private getQueuePosition(): number {
    // AI support queue logic
    return Math.floor(Math.random() * 5) + 1;
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    console.log('🔌 Message received in GATEWAY:', data); // ← This will work

    try {
      // Call your service to process the message
      await this.aiSupportService.handleChatIn(data);
    } catch (error) {
      console.error('Error in gateway:', error);
    }
  }
}
