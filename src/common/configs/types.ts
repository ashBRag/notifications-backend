export interface ChatMessage {
  text?: string;
  sender: any;
  id: string;
  userId: string;
  roomId: string;
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface PushNotification {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  deviceTokens: string[];
}

export interface WebhookPayload {
  url: string;
  method: 'POST' | 'PUT';
  headers: Record<string, string>;
  payload: any;
  retryCount?: number;
}
