'use strict';

export {start, stop};

import configurer from './configurer';
let server = require('./server');

// If module is executed then run the sever
// otherwise export the functionalities
if (require.main === module) {
  startServer().catch(function (error) {
    console.error('Server FAILURE', error);
    /* eslint-disable no-process-exit */
    process.exit(1);
    /* eslint-enable no-process-exit */
  });
}

export var start = startServer;
export var stop = stopServer;

function startServer() {
  start = Promise.reject(new Error('server is starting'));
  return configurer().then(config => server.start(config))
  .then(function () {
      stop = stop;
      start = Promise.reject(new Error('server is already running'));
  })
  .catch(function (error) {
    start = startServer;
    throw error;
  });
}

function stopServer() {
  stop = Promise.reject(new Error('server is stopping'));
  return server.stop.then(function () {
    start = startServer;
    stop = Promise.reject(new Error('Server is not started'));
  }).catch(function (error) {
    module.exports.stop = stop;
    throw error;
  });
}
