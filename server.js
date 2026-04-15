const Fastify = require('fastify');
const fastifyCors = require('@fastify/cors');
const { initializeMongoDB, getGCSClient } = require('./config/storage-config');
const { loadModules, getRoutes } = require('./routes/index.js');

const info = require('./package.json');
const { logger } = require('./common');
const metricsPlugin = require('fastify-metrics');

const fastify = Fastify({
  trustProxy: true,
  disableRequestLogging: true,
  logger: true,
  bodyLimit: 52428800,
  ajv: {
    customOptions: {
      strict: false,
      removeAdditional: false
    }
  }
});

function setupHooks(fastify) {
  fastify.addHook('onRequest', (request, _reply, done) => {
    request._startTime = Date.now();
    request.mongoClient = fastify.mongoClient;
    request.gcpConn = fastify.gcpConn;
    logger.debug('Request received', {
      method: request.method,
      url: request.url,
      requestId: request.id
    });
    done();
  });

  fastify.addHook('onSend', (request, reply, payload, done) => {
    const duration = Date.now() - request._startTime;
    const statusCode = reply.statusCode;
    let parsedPayload;
    try {
      parsedPayload = typeof payload === 'string' ? JSON.parse(payload) : payload;
    } catch {
      parsedPayload = payload;
    }

    const logData = {
      method: request.method,
      url: request.url,
      duration: `${duration}ms`,
      statusCode,
      requestId: request.id,
      response: parsedPayload
    };

    if (statusCode >= 400) {
      logger.error(`Request failed with ${statusCode}`, logData);
    } else {
      logger.debug('Request completed', logData);
    }

    done(null, payload);
  });

  fastify.addHook('onError', (request, reply, error, done) => {
    logger.error('Request failed', {
      method: request.method,
      url: request.url,
      duration: `${Date.now() - request._startTime}ms`,
      error: error.message,
      statusCode: reply.statusCode,
      requestId: request.id
    });
    done();
  });
}

function setupRoutes(fastify) {
  fastify.get('/automation-service/info', (request, reply) => {
    reply.send({ api: info.name, version: info.version });
  });

  fastify.route({
    method: 'GET',
    url: '/automation-service/health',
    handler: async (request, reply) => reply.code(200).send('OK')
  });

  for (const route of getRoutes()) {
    fastify.route(route);
  }
}

async function initializeServer() {
  await fastify.register(fastifyCors, { origin: true, credentials: true });
  await fastify.register(metricsPlugin, { endpoint: '/automation-service/api' });

  const mongoClient = await initializeMongoDB();
  const gcpConn = {
    storage: getGCSClient()
  };
  fastify.decorate('mongoClient', mongoClient);
  fastify.decorate('gcpConn', gcpConn);
  loadModules(mongoClient, gcpConn);
  setupHooks(fastify);
  setupRoutes(fastify);

  if (process.env.NODE_ENV !== 'test') {
    fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
      if (err) {
        fastify.log.error(err);
        process.exit(1);
      }
      logger.debug(`Server listening on ${address}`);
    });
  }

  return fastify;
}

(async () => {
  try {
    await initializeServer();
  } catch (err) {
    logger.error('Server startup failed', { error: err.message, stack: err.stack });
    process.exit(1);
  }
})();

module.exports = fastify;
