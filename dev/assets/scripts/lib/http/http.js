'use strict';

var HTTP = require('http');
var HTTPS = require('https');
var url = require('url');
var debug = require('debug')('http-client');
var dotQs = require('dot-qs');
var paramCase = require('param-case');
var errors = require('./errors');

var invalidParameter = errors.invalidParameter;
var requestError = errors.requestError;
var httpErrorResponse = errors.httpErrorResponse;
var applicationErrorResponse = errors.applicationErrorResponse;

module.exports = {
  request: makeRequest
};

var urlQueryRegExp = /^(\/.*)(\?.*)$/;

/**
 * @param {(Object|string)} reqURL - When object it must be the object accepted by
 *      api/http and api/http with `scheme` property to specify `http` or `https`, if
 *      `scheme` is not specified `https` if port is 443, otherwise `http` when it has
 *      another value error is reported.
 * @param {Object} [data] - Data to send; it will be send in the query string or body
 *      depending of the http's request method is GET (query) or POST/PUT (body)
 * @returns {Promise}
 */
function makeRequest(reqURL, data) {
  var reqObj = normaliseRequest(reqURL);

  if (data) {
    try {
      switch (reqObj.method) {
        case 'POST':
        case 'PUT':
          debug('data will be send in the body');
          reqObj.body = JSON.stringify(data);
          setHeaderIfNotSet(reqObj, 'Content-Type', 'application/json');
          setHeaderIfNotSet(reqObj, 'Content-Length', reqObj.body.length);
        break;
        default:
          debug('data will be send in the URL query');

          if (reqObj.search) {
            reqObj.path += '&' + marshalQueryString(data);
          } else {
            reqObj.path += '?' + marshalQueryString(data);
          }
      }
    } catch (e) {
      return Promise.reject(invalidParameter('data', 'Invalid data, it cannot be formatted. ', e));
    }
  }

  return sendingRequest(reqObj);
}

function sendingRequest(reqObj) {
  var client = (reqObj.scheme === 'http') ? HTTP : HTTPS;

  return new Promise(function (resolve, reject) {
    debug('sending %s request', reqObj.scheme);
    var req = client.request(reqObj, function (res) {
      debug('received status response %s', res.statusCode);
      if (res.statusCode >= 400) {
        reject(httpErrorResponse(reqObj, res));
        return;
      }

      var chunks = [];

      res.on('data', function (chunk) {
        debug('receiving data chunk');
        chunks.push(chunk);
      });

      res.once('end', function () {
        debug('response data received');
        res.removeAllListeners();
        // Parse body and ends promise
        processBody(reqObj, res, chunks, resolve, reject);
      });

      res.once('error', function (err) {
        res.removeAllListeners();
        reject(applicationErrorResponse(reqObj, res, null, err));
      });
    });

    req.once('error', function (err) {
      reject(requestError(reqObj, err));
    });

    req.end(reqObj.body);
  });
}

function processBody(reqURL, res, bodyChunks, resolve, reject) {
  var rawBody = bodyChunks.join('');
  var body;

  try {
    debug('parsing response body');
    body = JSON.parse(rawBody);
  } catch (e) {
    e.message = 'Error parsing response body as JSON';
    reject(applicationErrorResponse(reqURL, res, rawBody, e));
    return;
  }

  debug('checking application response status');
  if (!body.status) {
    reject(applicationErrorResponse(reqURL, res, body, new Error('Malformed API body response')));
    return;
  }

  if (body.status === 'error') {
    reject(applicationErrorResponse(reqURL, res, body));
    return;
  }

  resolve(body);
}

/**
 * Normalise a Node request object (api/http or api/https) or string to an
 * URL object (api/url)  that define if to use HTTP or HTTPS
 *
 * @param {(Object|string)} reqURL
 * @returns {Object} Object with scheme defined (reqURL.scheme)
 */
function normaliseRequest(reqURL) {
  var reqURLObj = (typeof reqURL === 'string') ? url.parse(reqURL) : shallowClone(reqURL);

  // Identify scheme
  if (typeof reqURLObj.scheme === 'string') {
    reqURLObj.scheme = reqURLObj.scheme.toLowerCase();
  } else if (typeof reqURLObj.protocol === 'string') {
    reqURLObj.scheme = reqURLObj.protocol.toLowerCase();
  }

  switch (reqURLObj.scheme) {
    case 'http':
    case 'http:':
      reqURLObj.scheme = 'http';
      break;
    case 'https':
    case 'https:':
      reqURLObj.scheme = 'https';
      break;
    case null:
    case undefined:
      if (String(reqURLObj.port) === '443') {
        reqURLObj.scheme = 'https';
      } else {
        reqURLObj.scheme = 'http';
      }
      break;
    default:
      throw invalidParameter('reqURLObj.scheme', reqURLObj.scheme, new Error('Protocol non-supported'));
  }

  if (!reqURLObj.method) {
    reqURLObj.method = 'GET';
  } else {
    reqURLObj.method = reqURLObj.method.toUpperCase();
  }

  if (!reqURLObj.pathname) {
    var pathSplit = urlQueryRegExp.exec(reqURLObj.path);

    if (pathSplit !== null) {
      reqURLObj.search = pathSplit[2];
    }
  }

  return reqURLObj;
}

function objectToDashCase(obj) {
  var result = {};
  Object.keys(obj).forEach(function (key) {
    result[paramCase(key)] = obj[key];
  });
  return result;
}

function marshalQueryString(query) {
  if (query instanceof Object) {
    if (query instanceof Array) {
      return dotQs.stringify(query);
    }

    var objKeys = Object.keys(query);
    var allAreBasicAndArraysTypes = objKeys.every(function (key) {
      return (query[key] instanceof Array) || (typeof query[key] !== 'object');
    });

    if (!allAreBasicAndArraysTypes) {
      return dotQs.stringify(objectToDashCase(query));
    }

    // Concat all the arrays
    return objKeys.reduce(function (prev, key) {
      if (prev !== '') {
        prev += '&';
      }

      var paramName = paramCase(key);
      if (query[key] instanceof Array) {
        return prev + paramName + '=' + query[key].join('&' + paramName + '=');
      } else {
        return prev + paramName + '=' + encodeURIComponent(query[key]);
      }
    }, '');
  }

  throw new Error('Invalid type to be formated as query string');
}

function setHeaderIfNotSet(reqObj, field, value) {
  if (!reqObj.headers) {
    reqObj.headers = {};
  }

  if (!reqObj.headers[field]) {
    reqObj.headers[field] = value;
  }
}

function shallowClone(src) {
  var dest = {};

  Object.keys(src).forEach(function (key) {
    dest[key] = src[key];
  });

  return dest;
}
