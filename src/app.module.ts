// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './common/health/health.module';
import { KafkaService } from './common/kafka/kafka.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HealthModule],
  providers: [KafkaService],
})
export class AppModule {}
