console.log('Cloud code connected')

const {config, SITE, ROLE_ADMIN, ROLE_EDITOR, promisifyW, getAllObjects} = require('./common');

(async () => await import('./palette.mjs'))()