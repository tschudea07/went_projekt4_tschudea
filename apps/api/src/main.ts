import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { trustedOrigins } from './lib/config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.enableCors({
    origin: trustedOrigins,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
