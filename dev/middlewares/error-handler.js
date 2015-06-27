'use strict';

export default middleware;

function middleware(config) {
  let logger = config.get('logger');

  return function (error, req, res) {
    logger.error(error.stack);

    if (config.env === 'production') {
      res.render('error');
    } else {
      res.render('error', { message: error.message });
    }
  };
}
