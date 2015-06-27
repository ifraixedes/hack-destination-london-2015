'use strict';

export default middlewares;

function middlewares (config) {
  return {
    requestLogger: require('morgan')(config.get('middlewares').logger.format, config.get('middlewares').logger.options),
    bodyParser: require('body-parser').urlencoded({ extended: true }),
    notFoundHandler: require('./not-found-handler')(config),
    errorHandler: require('./error-handler')(config),
    generalCachingPolicy: require('./general-caching-policy')(config)
  };
}
