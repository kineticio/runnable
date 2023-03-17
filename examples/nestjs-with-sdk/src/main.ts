/* eslint-disable no-console */
import { RunnableWs } from '@runnablejs/sdk';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get Runnable actions
  const actions = app.get('RUNNABLE_ACTIONS');

  // Start express server
  await app.listen(process.env.PORT || 3002);
  const logger = new Logger('RunnableSDK');
  logger.log(`Application is running on: ${await app.getUrl()}`);

  // Start Runnable server
  new RunnableWs(actions, {
    namespace: 'user-server',
    runnableHost: 'ws://localhost:3000',
    logger: logger,
    token: 'another-secret',
  }).start();
}

bootstrap();
