import { INestApplication, ValidationPipe } from '@nestjs/common';

export function getApiPrefix(): string {
  const base = process.env.API_PREFIX ?? 'api';
  const version = process.env.API_VERSION ?? 'v1';
  return `${base}/${version}`;
}

export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix(getApiPrefix());

  app.enableCors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
