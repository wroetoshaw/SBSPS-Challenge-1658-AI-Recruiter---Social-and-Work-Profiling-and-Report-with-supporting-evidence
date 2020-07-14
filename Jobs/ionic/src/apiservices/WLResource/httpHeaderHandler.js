/*
* Licensed Materials - Property of IBM
* (C) Copyright IBM Corp. 2014. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/

const { Interceptor } = require('../baseProxy');
const { InvocationContext } = require('../baseProxy');
const util = require('util');
const logger = require('../../util/loggerUtil');

const JSON_CONTENT_TYPE = 'application/json';

const HTTPHeaderHandler = function () {
  Interceptor.apply(this, Array.prototype.slice.call(arguments));
};

util.inherits(HTTPHeaderHandler, Interceptor);

HTTPHeaderHandler.prototype.request = function (context, next) {
  try {
    const reqHttpHeaders = context.endpoint.req.headers;
    reqHttpHeaders.Accept = JSON_CONTENT_TYPE;
    reqHttpHeaders['Content-Type'] = JSON_CONTENT_TYPE;

    const headersInDatasource = context.operation.datasource.dsMoreInfo.consumes;
    if (headersInDatasource && headersInDatasource.length > 0) {
      if (headersInDatasource.indexOf(JSON_CONTENT_TYPE) === -1) {
        reqHttpHeaders['Content-Type'] = headersInDatasource[0];
      }
    }
  } catch (err) {
    logger.error('HTTPHeaderHandler', 'request', 'Error:', err);
    context.payload = err;
    context.interactionType = InvocationContext.INTERACTION_FAULT_TYPE;
  } finally {
    next();
  }
};

module.exports = HTTPHeaderHandler;
