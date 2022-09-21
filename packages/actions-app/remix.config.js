let packageJson = require('./package.json');

const deps = [...Object.keys(packageJson.dependencies)];

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  cacheDirectory: './node_modules/.cache/remix',
  ignoredRouteFiles: ['**/.*', '**/*.css', '**/*.test.{js,jsx,ts,tsx}'],
  serverDependenciesToBundle: [
    // regex that matches none of deps
    new RegExp(`^(?!${deps.join('|')})`),
    'react-focus-lock',
    'react-fast-compare',
    'react-remove-scroll',
    'react-clientside-effect',
    'react-remove-scroll-bar',
    'react-remove-scroll-bar/constants',
    'react-style-singleton',
  ],
};
