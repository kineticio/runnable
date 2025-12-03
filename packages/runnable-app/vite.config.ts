import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    reactRouter(),
    {
      name: 'handle-well-known',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/.well-known/appspecific/com.chrome.devtools.json') {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Not found' }));
            return;
          }
          next();
        });
      },
    },
  ],
});
