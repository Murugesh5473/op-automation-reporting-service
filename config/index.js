const storageConfig = require('./storage-config.js');
const modulesConfig = require('./modules-config.js');

module.exports = {
  ...storageConfig,
  ...modulesConfig
};
