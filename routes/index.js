const { modules } = require('../config');

let routeList = [];
let registerPluginsList = [];

/**
 * loadModules loading all modules for routing and proxies
 *
 * @param {Object} mongoClient - MongoDB client instance
 * @example loadModules(mongoClient)
 */
function loadModules(mongoClient, gcpConn) {
  Object.keys(modules).forEach((x) => {
    const options = { mongoClient, gcpConn };

    const module = require(modules[x])(options);

    if (!module || typeof module !== 'object') return;

    const { routes, registerPlugins, initialize } = module;

    if (initialize) initialize();

    routeList = routeList.concat(routes || []);
    registerPluginsList = registerPlugins ? registerPluginsList.concat(registerPlugins) : registerPluginsList;
  });
}

module.exports = {
  loadModules,
  getRoutes: () => [...routeList],
  getRegisterPlugins: () => registerPluginsList
};
