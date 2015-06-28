'use strict';

var url = require('url');

module.exports = {
  invalidParameter: invalidParameter,
  requestError: requestError,
  applicationErrorResponse: applicationErrorResponse,
  httpErrorResponse: httpErrorResponse
};

/**
 * Populate error or create a new one composing a
 * message with paramName, msg and error.message if error
 * it's provided
 *
 * @param {string} paramName - Incorrect parameters name
 * @param {string} msg - Custom message to add
 * @param {Error} [error] - Original error
 * @returns {Error} - error or new Error
 */
function invalidParameter(paramName, msg, error) {
  if (!error) {
    error = new Error('');
  }

  error.message = paramName + ': ' + msg + '. ' + error.message;
  return error;
}

/**
 * Clarify the produced issue with request prepending a notice
 * in the original error message
 *
 * @param {(Object|string)} reqURL - Used request
 * @param {Error} error - Original error
 * @returns {Error} - error
 */
function requestError(reqURL, error) {
  var parsedURL;
  if (typeof reqURL === 'object') {
    parsedURL = url.format(reqURL);
  } else {
    parsedURL = reqURL;
  }

  error.message = 'Problem requesting ' + parsedURL + ' : ' + error.message;
  return error;
}

/**
 * Populate error or create a new one with type for application
 * server error
 *
 * @param {(Object|string)} reqURL
 * @param {Object} res - Response object
 * @param {Object|string} [body] - Response's original body or parsed body.
 *      Must be null if no body and error is passed
 * @param {Error} [error] - Original captured error
 * @returns {Error} - error or new Error
 */
function applicationErrorResponse(reqURL, res, body, error) {
  if (!error) {
    error = new Error('');
  } else {
    error.message = '. ' + error.message;
  }

  var parsedURL;
  if (typeof reqURL === 'object') {
    parsedURL = url.format(reqURL);
  } else {
    parsedURL = reqURL;
  }

  error.statusCode = res.statusCode;

  error.message = 'Error receiving response data '
    + parsedURL
    + ' request'
    + '. Error message: '
    + error.message;

  if (typeof body === 'string') {
    error.message = 'Error parsing response body of '
      + parsedURL
      + ' request. Body: '
      + body
      + '. Error message: '
      + error.message;

  } else {
    error.apiStatus = body.status;
    error.apiMessage = body.message;
  }

  return error;
}

/**
 * Create a new error with HTTP values
 *
 * @param reqURL {(Object|string)}
 * @param res {Object} Response object
 * @returns {Error}
 */
function httpErrorResponse(reqURL, res) {
  var parsedURL;
  if (typeof url === 'object') {
    parsedURL = url.format(reqURL);
  } else {
    parsedURL = reqURL;
  }

  var error = new Error('Error received when requesting ' + parsedURL);
  error.statusCode = res.statusCode;

  return error;
}
