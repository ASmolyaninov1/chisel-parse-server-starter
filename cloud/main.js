console.log('Cloud code connected');

(async () => {
  const captureWebsite = await import('capture-website')
  console.log('captureWebsite ===> ', captureWebsite);
})()

require('./common');
require('./palette');
// (async () => await import('./palette.js'))()