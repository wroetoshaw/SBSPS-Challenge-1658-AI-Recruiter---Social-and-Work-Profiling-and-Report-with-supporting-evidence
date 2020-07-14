
const { Interceptor } = require('../baseProxy');
const { InvocationContext } = require('../baseProxy');
const util = require('util');
const logger = require('../../util/loggerUtil');


/**
 * Append addtional information within the response payload
 * e.g:
 *   pagination information, status
 */
function formatResponse(context, payload) {
  const result = {};
  result.headers = context.endpoint.resp.headers;
  if (!Array.isArray(payload)) {
    const arrayWrapper = [];
    arrayWrapper.push(payload);
    payload = arrayWrapper;
  }
  result.body = payload;
  result.columns = context.columns;
  result.options = context.endpoint.resp.options;
  result.status = context.endpoint.resp.status;
  result.status_desc = context.payload.status_desc;

  return result;
}

function checkStatusCode(context, payload) {
  if (context.payload === '') {
    // context.payload = {};
  }
  const verbActionInfo = context.operation.datasource.dsMoreInfo;
  const { responseObj } = verbActionInfo;
  if (responseObj) {
    const { status } = context.endpoint.resp;
    const statusObj = responseObj[status];
    if (statusObj) {
      if (!statusObj.schema) {
        if (typeof context.payload === 'object') {
          context.payload.status_desc = statusObj.description;
        } else {
          context.payload = {
            status_desc: statusObj.description,
          };
        }
      } else if (!payload.schema) {
        if (payload.error) {
          context.payload.status_desc = payload.error;
        }
      }
    } else {
      // unknown error/response from API
      if (typeof context.payload === 'object') {
        context.payload.status_desc = `status - ${status}: error - ${payload.error}`;
      } else {
        context.payload = {
          status_desc: `${context.payload} status: ${status}: error - ${payload.error}`,
        };
      }
    }
  }
}


const FormatResponseHandler = function () {
  Interceptor.apply(this, Array.prototype.slice.call(arguments));
};

util.inherits(FormatResponseHandler, Interceptor);

FormatResponseHandler.prototype.response = function (context, next) {
  try {
    checkStatusCode(context, context.payload);
    if (!context.payload) return;
    if (context.operation.verb !== 'GET') return;


    const fixedPayload = formatResponse(context, context.payload);
    context.payload = fixedPayload;
    if (!context.payload) {
      context.payload = [];
    }
  } catch (err) {
    logger.error('FormatResponseHandler', 'response', 'Error:', err);
    context.payload = err;
    context.interactionType = InvocationContext.INTERACTION_FAULT_TYPE;
  } finally {
    next();
  }
};

module.exports = FormatResponseHandler;
