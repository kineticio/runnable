---
title: Getting Started | Guide
---

# Getting Started

## Overview

Runnable is a framework to build admin applications, with little code and no maintenance.

You don't need to write any UI code or deploy another frontend.

## Checkout the demo

You can play around with the demo application [here](https://demo.getrunnable.com).

## Installing Runnable

With npm

```bash
npm install -D @runnablejs/express
```

or with yarn

```bash
yarn add -D @runnablejs/express
```

or with pnpm

```bash
pnpm add -D @runnablejs/express
```

## Setting up Runnable

Runnable integrates directly with your Next.js or Express application.

### Setting up with Express

```ts
// index.ts
import express from 'express';
import { installRunnable } from '@runnablejs/express';
import { getUsers, getTeams, assignTeam } from './db';
import { auth } from './auth';

const app = express();

// ... normal express setup

installRunnable(
  app,
  {
    assign_user_to_team: {
      title: 'Assign user to team',
      execute: async (io) => {
        const users = await getUsers();
        const user = await io.select.dropdown({
          title: 'Select user',
          data: users,
          getLabel: (user) => user.name,
          getValue: (user) => user.id,
        });

        const teams = await getTeams();
        const team = await io.select.table({
          title: 'Select team',
          data: teams,
          headers: ['Name', 'Team size'],
          initialSelection: user.teamId,
          getValue: (team) => team.id,
          getRow: (team) => [team.name, team.members.length],
        });

        await assignTeam(user.id, team.id);
      },
    },
  },
  { auth: auth }
);

app.listen(3000);
```

### Setting up with Next.js

Create the providers for the `Actions` and `ActionsContext`.

```ts
// actions.provider.ts

import { FactoryProvider, Provider } from '@nestjs/common';
import { Actions, RunnableAppContext } from '@runnablejs/express';
import { AppService } from './app.service';

export const ActionsProvider: FactoryProvider<Actions> = {
  provide: 'ACTIONS',
  inject: [AppService],
  useFactory: (database: DatabaseService) => ({
    assign_user_to_team: {
      // ...
    },
    create_user: {
      // ...
    },
  }),
};

export const RunnableAppContextProvider: Provider<RunnableAppContext> = {
  provide: 'ACTIONS_APP_CONTEXT',
  useFactory: (authService: AuthService) => ({
    auth: {
      verifyLogin: (opts) => authService.verifyLogin(opts),
      getUserById: ({ id }) => authService.getUserById(id),
    },
  }),
};
```

Create the module for the `Actions` and `ActionsContext`.

```ts
// actions.module.ts
import { Module } from '@nestjs/common';
import { ActionsProvider, RunnableAppContextProvider } from './actions.provider';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [AuthModule],
  providers: [ActionsProvider, ActionsActionsContextProvider],
})
export class ActionsModule {}
```

Start your Next.js application with `Actions`.

```ts
// main.ts
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
```
