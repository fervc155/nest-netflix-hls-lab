import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducer implements OnModuleInit {
  private producer: Producer;

  async onModuleInit() {
    const kafka = new Kafka({
      clientId: 'api',
      brokers: ['kafka:9092'], // nombre del servicio en docker
    });

    this.producer = kafka.producer();
    await this.producer.connect();
  }

  async emitVideoUploaded(payload: any) {
    await this.producer.send({
      topic: 'video_uploaded',
      messages: [
        {
          key: payload.id,
          value: JSON.stringify(payload),
        },
      ],
    });
  }
}
