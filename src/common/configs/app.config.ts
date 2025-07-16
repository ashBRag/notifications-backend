import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
 kafka: {
   brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
   clientId: process.env.KAFKA_CLIENT_ID || 'notifications-service'
 },
 websocket: {
   cors: {
     origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*']
   }
 },
 push: {
   fcm: {
     serverKey: process.env.FCM_SERVER_KEY
   }
 }
}));