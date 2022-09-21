import { Module } from '@nestjs/common';
import { ActionsProvider, ActionsAppContextProvider } from './actions.provider';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ActionsProvider, ActionsAppContextProvider],
})
export class AppModule {}
