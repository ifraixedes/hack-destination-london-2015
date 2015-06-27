'use strict';

export default routes;

function routes(config) {
  return {
    '': require('./home')(config)
  };
}
