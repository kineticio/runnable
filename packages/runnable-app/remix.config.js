const { mountRoutes } = require('remix-mount-routes');
let packageJson = require('./package.json');

const deps = [...Object.keys(packageJson.dependencies)];

const basePath = process.env.ACTIONS_BASE_URL || '/admin';

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: './node_modules/.cache/remix',
  ignoredRouteFiles: ['**/.*', '**/*.css', '**/*.test.{js,jsx,ts,tsx}'],
  publicPath: `${basePath}/build/`,
  routes: () => {
    return mountRoutes(basePath, 'routes');
  },
  future: {},
  serverDependenciesToBundle: [
    // Bundling all deps
    /^.*/,
  ],
};
