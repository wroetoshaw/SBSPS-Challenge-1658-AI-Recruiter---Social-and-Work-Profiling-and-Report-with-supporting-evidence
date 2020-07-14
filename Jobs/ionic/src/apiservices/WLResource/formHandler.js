const { InvocationContext } = require('../baseService');
const { Interceptor } = require('../baseService');
const util = require('util');


const FormHandler = function () {
  Interceptor.apply(this, Array.prototype.slice.call(arguments));
};

util.inherits(FormHandler, Interceptor);

function formPayload(dsMoreInfo, params) {
  if (!dsMoreInfo) return null;
  if (!params || params.length <= 0) return null;

  if (dsMoreInfo.bodyList && dsMoreInfo.bodyList.length > 0) {
    const schemaObj = dsMoreInfo.bodyList[0].schema;
    if (schemaObj) {
      let bodyObj = generateJsonObjFrmSchema(schemaObj.properties, params, null);
      console.log(
        'FormHandler', 'formPayload',
        `requestBodyObj ${JSON.stringify(
          bodyObj,
          (key, value) => { if (value === undefined) { return null; } return value; },
        )}`,
      );
      return bodyObj;
    }

    return null;
    
  } else {
    return null;
  }

}

/**
 * generateJsonObjFrmSchema converts the json schema properties to json object
 *
 *
 */
function generateJsonObjFrmSchema(PROPS, params, parentkey) {
  const childObj = {};

  for (const key in PROPS) {
    let parampath_formed = parentkey;
    if(parampath_formed != null) {
      parampath_formed = `${parampath_formed}.${key}`;
    } else {
      parampath_formed = key;
    }
    switch (PROPS[key].type) {
      case 'boolean':
      case 'integer':
      case 'number':
      case 'string':
        
        let value = getValue(PROPS, params, key, parampath_formed);
        childObj[key] = value;
        break;
      case 'array':
        const arrList = [];
        if (PROPS[key].items.properties) {
          arrList.push(generateJsonObjFrmSchema(PROPS[key].items.properties, params, parampath_formed));
        } else {
          let value = getValue(PROPS, params, key, parampath_formed);
          //arrList.push(PROPS[key].items.type);
          arrList.push(value);
        }
        childObj[key] = arrList;
        break;
      case 'object':
        childObj[key] = generateJsonObjFrmSchema(PROPS[key].properties, params, parampath_formed);
        break;
    }
  }

  return childObj;
}

function getValue( PROPS, params, key, parampath_formed) {
  let value = PROPS[key].default || '';
  for (let k = 0; k < params.length; k += 1) {
    const param = params[k];
    const { parampath } = param;
    if(parampath === parampath_formed) {
      value =  param.value;
      break;
    }
  }
  
  return value;
}

FormHandler.prototype.request = function (context, next) {
  try {
    const payload = formPayload(context.operation.datasetInfo.verbRequestInfo.dsMoreInfo, context.operation.params);
    context.payload = payload;
  } catch (err) {
    console.error('FormHandler', 'request', 'Error:', err);
    err.status_code = 400;
    context.payload = err;
    context.interactionType = InvocationContext.INTERACTION_FAULT_TYPE;
  } finally {
    next();
  }
};

module.exports = FormHandler;
