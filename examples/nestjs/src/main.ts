import { installRunnable } from '@runnablejs/express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Runnable
  const actions = app.get('ACTIONS');
  const context = app.get('ACTIONS_APP_CONTEXT');
  installRunnable(app.getHttpServer()._events.request, actions, context);

  await app.listen(3000);
}

bootstrap();
