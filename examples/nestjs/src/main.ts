import { NestFactory } from '@nestjs/core';
import { installRunnable } from '@runnablejs/express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Runnable
  const actions = app.get('RUNNABLE_ACTIONS');
  const context = app.get('RUNNABLE_CONTEXT');
  installRunnable(app, actions, context);

  await app.listen(process.env.PORT || 3007);
  console.log(`Application is running on: ${await app.getUrl()}/admin`);
}

bootstrap();
