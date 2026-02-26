import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'crypto';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use((req: any, res: any, next: () => void) => {
    const id = req.headers['x-correlation-id'] ?? randomUUID();
    req.correlationId = id;
    res.setHeader('x-correlation-id', id as string);
    next();
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('ReefOps API')
    .setDescription('Enterprise aquarium management REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, doc);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
