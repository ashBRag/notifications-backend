/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // HTTP server for health checks
  const app = await NestFactory.create(AppModule);

  // Kafka microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: process.env.KAFKA_CLIENT_ID || 'notifications-service',
        brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
      },
      consumer: {
        groupId: process.env.KAFKA_GROUP_ID || 'notifications-group',
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
