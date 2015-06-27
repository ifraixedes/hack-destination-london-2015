'use strict';

export default middleware;

function middleware(config) {
  let logger = config.get('logger');

  return function (req, res) {
    logger.info('any route does not match to %s', req.path);
    res.status(404).render('not-found');
  };
}
