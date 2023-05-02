import { installRunnable } from '@runnablejs/express';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Runnable
  const actions = app.get('RUNNABLE_ACTIONS');
  const context = app.get('RUNNABLE_CONTEXT');
  installRunnable(app.getHttpServer()._events.request, actions, context);

  await app.listen(process.env.PORT || 3007);
  const logger = app.get(Logger);
  logger.log(`Application is running on: ${await app.getUrl()}/admin`);
}

bootstrap();
