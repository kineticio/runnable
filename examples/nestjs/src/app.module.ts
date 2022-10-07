import { Module } from '@nestjs/common';
import { ActionsProvider, RunnableAppContextProvider } from './actions.provider';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ActionsProvider, RunnableAppContextProvider],
})
export class AppModule {}
