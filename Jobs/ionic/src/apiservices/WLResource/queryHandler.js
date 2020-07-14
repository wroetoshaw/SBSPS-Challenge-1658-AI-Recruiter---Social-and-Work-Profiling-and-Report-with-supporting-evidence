const { InvocationContext } = require('../baseService');
const { Interceptor } = require('../baseService');
const util = require('util');


const QueryHandler = function () {
  Interceptor.apply(this, Array.prototype.slice.call(arguments));
};

util.inherits(QueryHandler, Interceptor);

function formQueryURL(queryAttributes, queryParams) {
  if (!queryAttributes || queryAttributes.length <= 0) return '';
  if (!queryParams || queryParams.length <= 0) return '';

  let queryURL = '?';
  queryAttributes.forEach((queryAttr, idx) => {
    let value = '';
    queryParams.forEach((param) => {
      const parampath =  param.parampath;
      if( parampath === queryAttr.parampath) {
        if(param.value && param.value !== null) {
          value = param.value;
        } else if(queryAttr.default) {
          value = queryAttr.default;
        }
        
        queryURL = `${queryURL + queryAttr.name}=${value}`;
      }
    });
  });

  return queryURL;
}

QueryHandler.prototype.request = function (context, next) {
  try {
    const url = formQueryURL(context.operation.datasetInfo.verbRequestInfo.queryAttributes, context.operation.params);
    context.operation.queryurl = url;
  } catch (err) {
    console.error('QueryHandler', 'request', 'Error:', err);
    err.status_code = 400;
    context.payload = err;
    context.interactionType = InvocationContext.INTERACTION_FAULT_TYPE;
  } finally {
    next();
  }
};

module.exports = QueryHandler;
