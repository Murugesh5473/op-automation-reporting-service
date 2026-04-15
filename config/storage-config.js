const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const logger = require('../common/logger');
const { Storage } = require('@google-cloud/storage');
/**
 * Default MongoDB connection options
 */
const defaultMongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  minPoolSize: 5
};

/**
 * MongoDB configuration
 */
const mongoConfig = {
  uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/',
  options: defaultMongoOptions
};

/**
 * Initialize MongoDB connection
 * @returns {Promise<MongoClient>} Connected MongoDB client instance
 */
async function initializeMongoDB() {
  logger.debug('MongoDB initialization started', {
    maxPoolSize: defaultMongoOptions.maxPoolSize,
    minPoolSize: defaultMongoOptions.minPoolSize,
    hasUri: !!mongoConfig.uri
  });

  try {
    const startTime = Date.now();
    const mongoClient = new MongoClient(mongoConfig.uri, mongoConfig.options);

    logger.debug('Attempting MongoDB connection...');
    await mongoClient.connect();

    const duration = Date.now() - startTime;
    logger.debug('MongoDB connection established successfully', {
      connectionTime: `${duration}ms`,
      status: 'connected'
    });

    mongoClient.on('connectionPoolCreated', (event) => {
      logger.debug('MongoDB connection pool created', { address: event.address });
    });

    mongoClient.on('connectionPoolClosed', (event) => {
      logger.debug('MongoDB connection pool closed', { address: event.address });
    });

    mongoClient.on('connectionCheckOutFailed', (event) => {
      logger.error('MongoDB connection checkout failed', {
        address: event.address,
        reason: event.reason
      });
    });

    return mongoClient;
  } catch (err) {
    logger.error('Failed to connect to MongoDB', {
      error: err.message,
      stack: err.stack,
      code: err.code
    });
    throw err;
  }
}

/**
 * Create a GCS client with credentials
 *
 * @returns { object } client object of gcp
 * @example getGCSClient
 */
function getGCSClient() {
  const projectId = process.env.NODE_ENV === 'prod' ? 'shared-infrastructure-396910' : 'np-shared-infrastructure';
  const options = { projectId };
  const keyFilename = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS || 'doc.json');
  if (fs.existsSync(keyFilename)) {
    options.keyFilename = keyFilename;
  }
  return new Storage(options);
}

/**
 * Close MongoDB connection
 * @param {MongoClient} mongoClient - MongoDB client instance to close
 */
async function closeMongoDB(mongoClient) {
  logger.debug('MongoDB connection close initiated');

  try {
    if (mongoClient) {
      const startTime = Date.now();
      await mongoClient.close();
      const duration = Date.now() - startTime;

      logger.debug('MongoDB connection closed successfully', {
        closeTime: `${duration}ms`,
        status: 'disconnected'
      });
    } else {
      logger.warn('MongoDB close called but no client instance provided');
    }
  } catch (err) {
    logger.error('Failed to close MongoDB connection', {
      error: err.message,
      stack: err.stack
    });
    throw err;
  }
}

module.exports = {
  mongoConfig,
  initializeMongoDB,
  closeMongoDB,
  getGCSClient
};
