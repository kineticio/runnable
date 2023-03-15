/* eslint-disable no-console */
import { Runnable } from '@runnablejs/sdk';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get Runnable actions
  const actions = app.get('RUNNABLE_ACTIONS');

  // Start express server
  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);

  // Start Runnable server
  new Runnable(actions).start({ port: 3007 });
}

bootstrap();
