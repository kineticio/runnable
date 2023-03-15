import { Module } from '@nestjs/common';
import { ActionsProvider } from './actions.provider';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ActionsProvider],
})
export class AppModule {}
