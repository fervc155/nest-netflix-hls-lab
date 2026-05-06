import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // en dev está bien así
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
  });

  await app.listen(3000);
}
bootstrap();
