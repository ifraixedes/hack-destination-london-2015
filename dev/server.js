'use strict';

export {start, stop};

let path = require('path');
let http = require('http');
let express = require('express');
let debug = require('debug');
let routesConfigurer = require('./routes');
let middlewares = require('./middlewares');

let server = null;

function start(config) {
  return new Promise(function (resolve) {
    let expressApp = express();
    let routes = routesConfigurer(config);
    debug = debug(config.get('debug').namespace + ':server');

    middlewares = middlewares(config);
    server = http.createServer(expressApp);
    expressApp.set('view engine', 'jade');
    expressApp.set('views', path.join(__dirname, 'views'));
    expressApp.set('etag', 'weak');

    // Pre-routing middlewares
    expressApp.use(middlewares.requestLogger);
    expressApp.use(middlewares.generalCachingPolicy);
    expressApp.use(middlewares.bodyParser);

    // Static assets
    expressApp.use('/styles', express.static(path.join(__dirname, 'public/styles')));
    expressApp.use('/scripts', express.static(path.join(__dirname, 'public/scripts')));
    expressApp.use('/images', express.static(path.join(__dirname, 'public/images')));
    expressApp.use('/font', express.static(path.join(__dirname, 'public/font')));
    expressApp.use(middlewares.generalCachingPolicy);

    // Routes
    Object.keys(routes).forEach(function (route) {
      expressApp.use(route, routes[route]);
    });

    // Post-send middlewares
    expressApp.use(middlewares.notFoundHandler);
    expressApp.use(middlewares.errorHandler);

    server.listen(config.get('server').port, config.get('server').ipAddress, function () {
      if (config.get('server').ipAddress) {
        debug('Server running on port %s:%s', config.get('server').ipAddress, config.get('server').port);
      } else {
        debug('Server running on port %s', config.get('server').port);
      }

      resolve();
    });
  });
}

function stop() {
  return new Promise(function (resolve) {
    if (server) {
      server.close(resolve);
      server = null;
    } else {
      setImmediate(resolve);
    }
  });
}
