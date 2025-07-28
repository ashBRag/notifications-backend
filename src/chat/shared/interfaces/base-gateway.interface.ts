import { ChatMessage } from '../../../common/configs/types';
import { Socket } from 'socket.io';

export interface IChatGateway {
  handleConnection(client: Socket): void;
  handleDisconnect(client: Socket): void;
  handleHealthPing(data: any, client: Socket): void;
  handleJoinRoom(data: { roomId: string }, client: Socket): void;
  sendToRoom(roomId: string, message: ChatMessage): void;
  sendToClients(message: ChatMessage): void;
}
