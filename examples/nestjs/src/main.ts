import { installActions } from '@kinetic-io/actions-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // kinetic
  const actions = app.get('ACTIONS');
  const context = app.get('ACTIONS_APP_CONTEXT');
  installActions(app.getHttpServer()._events.request, actions, context);

  await app.listen(3000);
}

bootstrap();
