import { Module } from '@nestjs/common';
import { VideosController } from './modules/videos/videos.controller';
import { VideosService } from './modules/videos/videos.service';
import { KafkaProducer } from './kafka/kafka.producer';

@Module({
  controllers: [VideosController],
  providers: [VideosService, KafkaProducer],
})
export class AppModule {}
