# Runnable Contributing Guide

## Repo Setup

The Runnable repo is a monorepo using pnpm workspaces. The package manager used to install and link dependencies must be [pnpm](https://pnpm.io/).

To develop:

1. Run `pnpm install` in the root folder
2. `cd packages/runnable-app`. `pnpm run dev` to run the server in watch mode.
3. In another tab, `cd examples/nestjs-with-sdk`. `pnpm run start` to run the client in watch mode.

To test:

1. Run
   - `pnpm run test` to run tests
