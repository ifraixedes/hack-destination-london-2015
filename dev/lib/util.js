'use strict';

export {expressAsyncWrapper};

function expressAsyncWrapper(asyncMiddleware) {
  return (...args) => {
    if (args.length > 3) {
      // asyncMiddleware is an error middleware
      if ((args[2] instanceof Function) === false) {
        return asyncMiddleware(...args).catch(args[3]);
      }
    }
    // asyncMiddleware is an usual middleware or a param callback
    return asyncMiddleware(...args).catch(args[2]);
  };
}
