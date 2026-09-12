import { NestFactory } from '@nestjs/core';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const corsList = (config.get<string>('CORS_ORIGINS', 'http://localhost:5173') ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsList,
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      exceptionFactory: (errors) => {
        const mensajes = errors.flatMap((e) =>
          Object.values(e.constraints ?? {}).map((m) => m),
        );
        return new UnprocessableEntityException(mensajes);
      },
    }),
  );

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`🚀 Tiendas Montaño API lista en http://localhost:${port}/api/v1`);
}
void bootstrap();