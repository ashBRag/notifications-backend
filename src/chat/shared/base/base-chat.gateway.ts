/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */

import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatMessage } from '../../../common/configs/types';
import { IChatGateway } from '../interfaces/base-gateway.interface';

export abstract class BaseChatGateway
  implements IChatGateway, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Abstract methods - each service must implement
  abstract getServiceName(): string;
  abstract getGatewayConfig(): any;

  // Shared implementation
  handleConnection(client: Socket): void {
    console.log(`[${this.getServiceName()}] Client connected: ${client.id}`);
    this.onClientConnect(client);
  }

  handleDisconnect(client: Socket): void {
    console.log(`[${this.getServiceName()}] Client disconnected: ${client.id}`);
    this.onClientDisconnect(client);
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
      service: this.getServiceName(),
    });
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    client.join(data.roomId);
    console.log(
      `[${this.getServiceName()}] Client ${client.id} joined room: ${data.roomId}`,
    );
    this.onRoomJoin(client, data.roomId);
  }

  sendToRoom(roomId: string, message: ChatMessage): void {
    this.server?.to(roomId).emit('message', {
      ...message,
      service: this.getServiceName(),
      timestamp: Date.now(),
    });
  }

  sendToClients(message: ChatMessage): void {
    this.server?.emit('message', {
      ...message,
      service: this.getServiceName(),
      timestamp: Date.now(),
    });
  }

  // Optional hooks for service-specific logic
  protected onClientConnect(client: Socket): void {
    // Override in child classes if needed
  }

  protected onClientDisconnect(client: Socket): void {
    // Override in child classes if needed
  }

  protected onRoomJoin(client: Socket, roomId: string): void {
    // Override in child classes if needed
  }
}
