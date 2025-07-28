// apps/ai-support-chat/ai-support-chat.gateway.ts
import { WebSocketGateway } from '@nestjs/websockets';
import { BaseChatGateway } from '../../shared/base/base-chat.gateway';
import { Socket } from 'socket.io';

@WebSocketGateway({
  port: 3001,
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
}
