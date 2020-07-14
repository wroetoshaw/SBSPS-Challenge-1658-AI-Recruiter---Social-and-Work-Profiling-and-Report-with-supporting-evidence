
const Q = require('q');


const InvocationContext = function () {
  this.operation = null;
  this.options = null;

  this.interactionType = null;

  this.endpoint = null;
  this.payload = null;
};

InvocationContext.INTERACTION_REQUEST_TYPE = 'REQUEST';
InvocationContext.INTERACTION_RESPONSE_TYPE = 'RESPONSE';
InvocationContext.INTERACTION_FAULT_TYPE = 'FAULT';

/**
 * The base interceptor implementation
 *
 * For each specific interceptor, the 'getName' method is mandatory to be implemented. For other 3 methods,
 * either overwrite the methods or just delegate to this basic implementation.  Please make sure catch all of possible
 * exceptions in the interceptor and correctly set the invocation status in context. Any uncatch exception will case the
 * invocation chain broken
 *
 */
const Interceptor = function () {};

/**
 * Get the interceptor name
 *
 * @returns name
 */
Interceptor.prototype.getName = function () {
  throw new Error('Unsupported method in abstract base adapter proxy');
};

/**
 * Invoke in request path, the default behavior is do nothing, just call not next
 * @param context
 * @param next
 */
Interceptor.prototype.request = function (context, next) {
  next();
};

/**
 * Invoke in response path, the default behavior is do nothing, just call not next
 * @param context
 * @param next
 */
Interceptor.prototype.response = function (context, next) {
  next();
};

/**
 * Invoke in fault path, the default behavior is do nothing, just call not next
 * @param context
 * @param next
 */
Interceptor.prototype.fault = function (context, next) {
  next();
};

/**
 * Abstract proxy class which contains the basic methods for the adapter outbound request
 *  including: invocation context, dispatcher interceptor chains based invocation dispatcher,
 * For the specific protocol proxies, they need to extend to this base proxy, deliver the invoke
 * method implementation for specific transition protocol, e.g: Restful, MQTT and so on.
 *
 * @param {operation}, the object including below informations:
 * {
 *     verb: 'GET|PUT|POST|DELETE|PATCH',
 *     verburl:'verb url',
 *     queryparams: 'query parameters array'
 *     pathparams: 'path parameters array'
 *  }
 *
 *  @param {options}, including below informations:
 *  {
 *     authentication: 'the authentication credential info defined'
 *  }
 *
 */
const BaseService = function (operation, options, reqPayload) {
  this.context = new InvocationContext();
  this.context.operation = operation;
  this.context.options = options;
  this.context.payload = reqPayload;
  this.context.interactionType = InvocationContext.INTERACTION_REQUEST_TYPE;
  this.context.endpoint = {};

  this.interceptors = [];
  this.cursor = -1;
};

function _isEmptyObject(obj) {
  if (!obj) return true;

  if (typeof obj === 'string') {
    if (obj.trim() === '') {
      return true;
    }
    return false;
  }

  const keys = Object.getOwnPropertyNames(obj);
  if (!keys) return true;
  if (keys.length === 0) return true;

  return false;
}

/**
 * The dispatch controller for next step
 *
 */
BaseService.prototype.next = function () {
  const _self = this;

  switch (_self.context.interactionType) {
    case InvocationContext.INTERACTION_REQUEST_TYPE:
      _self.cursor += 1;
      if (_self.cursor < _self.interceptors.length) {
        _self.interceptors[_self.cursor].request(_self.context, _self.next.bind(_self));
        break;
      } else {
        _self.invoke(_self.context, _self.next.bind(_self));
        break;
      }
    case InvocationContext.INTERACTION_RESPONSE_TYPE:
      _self.cursor--;
      if (_self.cursor > -1) {
        this.interceptors[_self.cursor].response(_self.context, _self.next.bind(_self));
        break;
      }

      if (_self.cursor === -1) {
        _self.deferred.resolve(_self.context.payload);
        break;
      }
    case InvocationContext.INTERACTION_FAULT_TYPE:
      this.cursor--;
      if (_self.cursor > -1) {
        _self.interceptors[_self.cursor].fault(_self.context, _self.next.bind(_self));
        break;
      }

      if (_self.cursor === -1) {
        const fault = _self.context.payload;
        if (_self.context.endpoint && _self.context.endpoint.resp) {
          if (!_isEmptyObject(_self.context.endpoint.resp.headers)) {
            fault.headers = _self.context.endpoint.resp.headers;
          }
        }
        _self.deferred.reject(fault);
        break;
      }
      break;
    default: {
      const fault = new Error('Invalid interaction type', _self.context.interactionType);
      fault.status_code = 400;
      if (_self.context.endpoint && _self.context.endpoint.resp) {
        if (!_isEmptyObject(_self.context.endpoint.resp.headers)) {
          fault.headers = _self.context.endpoint.resp.headers;
        }
      }
      _self.deferred.reject(fault);
      break;
    }
  }
};

/**
 * Register interceptor for the proxy instance
 *
 * @param interceptor
 */
BaseService.prototype.use = function (interceptor) {
  if (!interceptor) return;

  this.interceptors.push(interceptor);
};

/**
 * The dispatch method to fire a adapter outbound call(CRUD communication to external data source)
 * dual promise/callback support
 *
 * @param cb,
 * @returns {promise}, with result of response
 */
BaseService.prototype.dispatch = function (cb) {
  const _self = this;
  return _self.init().then(() => {
    console.debug('BaseService --> dispatch --> Remote invocation dispatch is starting');
    _self._startDispatchTime = new Date().getTime();
    _self.deferred = Q.defer();
    _self.next();
    // set default promise timeout to 2 mins
    _self.deferred.promise.timeout(2 * 60 * 1000);
    return _self.deferred.promise.nodeify(cb);
  });
};

/**
 * The specific proxy should implement this method for the communication with external
 * data source via specific transition protocol, e.g: Restful etc.
 *
 * The invoker will be called at the end of interceptor chain, and the invoker is responsible for
 * change the interactionType from request to response or fault
 *
 * @param context
 * @param next
 */
BaseService.prototype.invoke = function (context, next) {
  throw new Error('Unsupported method in abstract base adapter proxy');
};

/**
 * The specific proxy should implement this method for the initialization job,
 *  including: interceptor chain creation
 *
 *  @return {promise}, true on success
 */
BaseService.prototype.init = function () {
  throw new Error('Unsupported method in abstract base adapter proxy');
};

/**
 * Return the name of proxy
 * @returns
 */
BaseService.prototype.getName = function () {
  return 'BaseService';
};


/**
 * Create a proxy instance per protocol type
 * @param operation
 * @param options
 * @param payload
 *
 * @return {promise}, the promise on proxy instance for successfully resolved
 */
BaseService.createProxy = function (operation, options, payload) {
  const method = 'createProxy';


  // Initialize API Service instance ( WLResource / )
  // Change the object based on type of service. For now Only WLResource is supported

  const WLResource = require('./WLResource');

  const proxyInst = new WLResource(operation, options, payload);
  proxyInst.init();
  console.debug('BaseService --> createProxy --> Created proxy instance for proxy type -', proxyInst.getName());

  return proxyInst;
};

module.exports.BaseService = BaseService;
module.exports.Interceptor = Interceptor;
module.exports.InvocationContext = InvocationContext;
