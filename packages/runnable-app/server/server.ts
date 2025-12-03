import 'dotenv/config';

import { createServer } from 'node:http';
import path from 'node:path';
import { createRequestHandler } from '@react-router/express';
import compression from 'compression';
import express from 'express';
import prom from 'express-prometheus-middleware';
import morgan from 'morgan';
import { serverEnv } from './server-env';
import { RunnableWsServer } from './ws/RunnableWsServer';

const app = express();
const metricsApp = express();

app.use(
  prom({
    metricsPath: '/metrics',
    collectDefaultMetrics: true,
    metricsApp,
  }),
);

app.use((req, res, next) => {
  // helpful headers:
  res.set('x-fly-region', serverEnv.FLY_REGION ?? 'unknown');
  res.set('Strict-Transport-Security', `max-age=${60 * 60 * 24 * 365 * 100}`);

  // /clean-urls/ -> /clean-urls
  if (req.path.endsWith('/') && req.path.length > 1) {
    const query = req.url.slice(req.path.length);
    const safepath = req.path.slice(0, -1).replace(/\/+/g, '/');
    res.redirect(301, safepath + query);
    return;
  }
  next();
});

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by');

// Remix fingerprints its assets so we can cache forever.
app.use('/build', express.static('public/build', { immutable: true, maxAge: '1y' }));

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static('public', { maxAge: '1h' }));

app.use(morgan('tiny'));

// Handle Chrome DevTools well-known file
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const MODE = serverEnv.NODE_ENV;
const BUILD_DIR = path.join(process.cwd(), 'build', 'server');
const build = require(BUILD_DIR);

app.all(
  '*',
  MODE === 'production'
    ? createRequestHandler({
        build: build,
        getLoadContext: () => {
          return {
            client: runnable,
            auth: {},
          };
        },
      })
    : (...args) => {
        purgeRequireCache();
        const requestHandler = createRequestHandler({
          build: build,
          mode: MODE,
          getLoadContext: () => {
            return {
              client: runnable,
              auth: {},
            };
          },
        });
        return requestHandler(...args);
      },
);

const { PORT, METRICS_PORT, RUNNABLE_AUTH_SECRET } = serverEnv;

const server = createServer(app);

const runnable = new RunnableWsServer({
  srv: server,
  secret: RUNNABLE_AUTH_SECRET,
}).listen(server);

server.listen(PORT, () => {
  console.log(`✅ app ready: http://localhost:${PORT}`);
});

metricsApp.listen(METRICS_PORT, () => {
  console.log(`✅ metrics ready: http://localhost:${METRICS_PORT}/metrics`);
});

function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't let
  // you have in-memory objects between requests in development,
  // alternatively you can set up nodemon/pm2-dev to restart the server on
  // file changes, we prefer the DX of this though, so we've included it
  // for you by default
  for (const key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      delete require.cache[key];
    }
  }
}
