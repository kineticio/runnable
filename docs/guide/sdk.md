---
title: Getting Started | Guide
---

# The Runnable SDK

The Runnable SDK is only necessary when deploying a standalone **Runnable Server**. The SDK provides a websocket connection between your server (the client) and the Runnable Server. For a given workflow, the client will send the workflow "view" (inputs, forms, tables, etc) and will receive the workflow "response" (input values and selections). All workflows are run on the client (i.e. your server).

## Supported languages

Runnable currently only has a JavaScript/TypeScript/Node SDK.

::: tip New Languages
We are open to add more supported languages - [please file an issue.](https://github.com/kineticio/runnable/issues)
:::
