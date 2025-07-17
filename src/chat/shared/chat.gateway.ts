import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatMessage } from '../../common/configs/types';

@WebSocketGateway({
  port: +(process.env.PORT || 3001),
  cors: { 
    origin: process.env.ALLOWED_ORIGINS?.split(','), 
    credentials: true 
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server | undefined;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('health-check-ping')
  handleHealthPing(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): void {
    client.emit('health-check-pong', {
      timestamp: Date.now(),
      received: data?.timestamp,
      status: 'healthy',
    });
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(data.roomId);
  }

  sendToRoom(roomId: string, message: ChatMessage): void {
    this.server.to(roomId).emit('message', message);
  }

  sendToClients(message: ChatMessage): void {
    this.server.emit('message', message);
  }
}
