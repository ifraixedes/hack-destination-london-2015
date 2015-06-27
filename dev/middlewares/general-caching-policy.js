'use strict';

export default middleware;

function middleware(config) {
  let cacheValue = `max-age=${config.get('cache').pages}`;

  return function (req, res, next) {
    res.set('Cache-Control', cacheValue);
    next();
  };
}
