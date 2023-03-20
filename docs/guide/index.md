---
title: Getting Started | Guide
---

# Getting Started

## Overview

Runnable is a powerful framework for building admin workflows with minimal code and zero maintenance.

- You don't need to write any UI code or deploy another frontend.
- Your internal operations stay _internal_.
- You don't need to build REST or GraphQL endpoints.
- Opinionated UI lets you focus on the business logic.
- Seamless integration with Nest.js and Express.
- Handle complex workflows with conditionals and loops.

## Checkout the demo

You can play around with the [demo Runnable](https://demo.getrunnable.com)! The password is `secret`.

## Runnable Mini and Runnable Server

There are two ways to deploy Runnable:

1. As a route (e.g. `/admin`) on an existing server like Express or Next.js.
2. As a standalone server to communicate with many Runnable "clients".

With option 1, Runnable is called **Runnable Mini**. Runnable Mini is a great way to get started with Runnable and a perfectly viable long-term solution. It's easy to set up and doesn't require any additional infrastructure.

With option 2, Runnable is called **Runnable Server**. Runnable Server is a great way to build a scalable admin tool. You can connect many clients, for example, a `user-service` and an `email-service` that can stream their actions to a central location. This is great for services not exposed to the public internet and for services that may be deployed with multiple instances.

Another way to compare their differences are the end user experience. For option 1, we may end up with our domains looking like. `https://api.mycompany.com/admin`. But if we end up creating multiple services in our organization each with their own **Runnable Mini**, our admin portals could be `https://api-users.mycompany.com/admin`, `https://api-documents.mycompany.com/admin`, etc. So instead we may want to deploy a standalone **Runnable Server** and stream all the admin workflows with the **Runnable SDK** to a single service exposed at `https://admin.mycompany.com`.

## Authentication

Both **Runnable Mini** and **Runnable Server** provide a built-in auth solution with various different auth providers to choose from. Checkout [Authentication](/guide/auth) to learn more.

## Examples

| Example                  | Source                                                                             |
| ------------------------ | ---------------------------------------------------------------------------------- |
| Runnable Mini + `nestjs` | [GitHub](https://github.com/kineticio/runnable/tree/main/examples/nestjs)          |
| Runnable SDK + `nestjs`  | [GitHub](https://github.com/kineticio/runnable/tree/main/examples/nestjs-with-sdk) |
