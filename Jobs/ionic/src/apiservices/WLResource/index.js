
const { BaseService } = require('../baseService');
const { InvocationContext } = require('../baseService');
const QueryHandler = require('./queryHandler');
const PathHandler = require('./pathHandler');
const FormHandler = require('./formHandler');
//const HTTPHeaderHandler = require('./httpHeaderHandler');
//const FormatResponseHandler = require('./formatResponseHandler');
const util = require('util');
const Q = require('q');


const verbToMethodMapping = {
  GET: 'get',
  PUT: 'put',
  PATCH: 'patch',
  POST: 'post',
  DELETE: 'del',
};

const PROXY_PROTOCOL_TYPE = 'WLResource';

const WLResource = function (opertions, options, payload) {
  BaseService.apply(this, Array.prototype.slice.call(arguments));

  /**
	 * endpoint: the restful endpoint, it includes below information:
	 *  {
	 *		type: rest,
	 *      url: url for the endpoint,
	 *      req: {
	 *			headers: {}
	 *          options: {}
	 *      },
	 *      resp: {
	 *           headers: {}
	 *           options: {}
	 *           status: {code:200, reason: error}
	 *      }
	 *  }
	 */
  if (!this.context.endpoint) {
    this.endpoint = {};
  }
  this.context.endpoint.type = PROXY_PROTOCOL_TYPE;
  this.context.endpoint.url = null;
  this.context.endpoint.req = { headers: {}, options: {} };
  this.context.endpoint.resp = { headers: {}, options: {}, status: {} };

  this.initPromise = null;
};
util.inherits(WLResource, BaseService);

/**
 * The initialization method for interceptor chain setup
 *
 * @return {promise}, true on successfully initialization
 */
WLResource.prototype.init = function () {
  const _self = this;
  if (_self.initPromise) return _self.initPromise;

  _self.initPromise = Q().then(() => {
    //_self.use(new FormatResponseHandler());
    _self.use(new QueryHandler());
    _self.use(new PathHandler());
    _self.use(new FormHandler());
    //_self.use(new HTTPHeaderHandler());
    //_self.use(new SecurityHandler());
    //_self.use(new ResponseColumnHandler());
    return true;
  });

  return _self.initPromise;
};

/**
 * Invoke method which will be called after go through all of interceptor defined in the chain
 *
 * @param context
 * @param next
 */
WLResource.prototype.invoke = function (context, next) {
  
    WLAuthorizationManager.obtainAccessToken("").then(
      (token) => {
          // alert('connect success');
          var resourceRequest = new WLResourceRequest(context.endpoint.url, context.operation.verb);
          resourceRequest.setHeader("Content-type", "application/json");
          resourceRequest.send(context.payload).then(
              (response) => {
                console.info(`WLResource --> invoke --> CONNECTED to the SERVER ==> ${context.operation.verb} : Status ${response.status} : ${context.endpoint.url}`);
                context.endpoint.resp.headers = response.responseHeaders;
                context.endpoint.resp.status = response.status;
                
                // if (!response.body) {
                //   context.payload = response.text;
                // } else {
                //   context.payload = response.body;
                // }

                context.payload = response.responseText;
          
                if (response.status === 403) {
                  context.interactionType = InvocationContext.INTERACTION_FAULT_TYPE;
                } else {
                  context.interactionType = InvocationContext.INTERACTION_RESPONSE_TYPE;
                }
                next();
              },
              (error) => {
                context.payload = new Error('Error in fetching data : '+ error.errorMsg + ' : ' + error.status);
                context.payload.status_code = 400;
                context.interactionType = InvocationContext.INTERACTION_FAULT_TYPE;
                next();
              }
          );
      }, (error) => {
          context.payload = new Error('Error accessing MobileFirst platform foundation server : '+ error.errorMsg + ' : ' + error.status);
          context.payload.status_code = 400;
          context.interactionType = InvocationContext.INTERACTION_FAULT_TYPE;
          next();
      }
  );
  
  
};

/**
 * Get name of the current proxy
 * @returns {String}
 */
WLResource.prototype.getName = function () {
  return 'WLResource';
};

module.exports = WLResource;
