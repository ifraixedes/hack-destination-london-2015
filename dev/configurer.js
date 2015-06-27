'use strict';

export default getConfig;

const winston = require('winston');

function getConfig() {
  let env = getEnvVariables();
  //let isProduction = env.node === 'production';

  let config = {
    env: env.node,
    server: {
      port: env.port
    },
    debug: {
      namespace: 'hack'
    },
    middlewares: {
      logger: {
        format: 'combined'
      }
    },
    logger: winston,
    cache: {
      pages: 3600
    }
  };

  return Promise.resolve(new Map(setIterabilityToObj(config)));
}

function getEnvVariables() {
  let env = process.env;
  return {
    node: env.NODE_ENV,
    port: env.IFC_PORT || 4000
  };
}

function setIterabilityToObj(obj) {
  obj[Symbol.iterator] = function* () {
    let keys = Object.keys(this);

    for (let k of keys) {
      yield [k, this[k]];
    }
  };

  return obj;
}
