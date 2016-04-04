import {FETCH} from './index';

/**
 * @see https://github.com/lodash/lodash/blob/4.8.0/lodash.js#L10705
 * @see https://lodash.com/docs#isObject
 */
function isObject(value) {
  const type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * A middleware which automatically converts object bodies to JSON for fetch effects.
 *
 * The middleware intercepts all fetch actions, and encodes their body to JSON if
 *
 * - the request has a `Content-Type: application/json` and
 * - the body is an object.
 *
 * In this case it also adds an `Accept: application/json` header but only if there's no other `Accept` header yet.
 *
 * Hook into **before** the regular fetch middleware.
 */
const fetchEncodeJSON = () => next => action =>
  action.type === FETCH ?
    next(maybeConvertBodyToJSON(action)) :
    next(action);

/**
 * Whether we may convert a request with the given params to JSON.
 */
const shallConvertToJSON = (params) =>
      isObject(params.body) && params.headers && params.headers['Content-Type'] === 'application/json';

/**
 * Add an accept header if necessary.
 *
 * Add an `Accept: application/json` header to the given headers but only if they don't already contain an `Accept`
 * header.
 */
const maybeAddAcceptHeader = (headers) =>
      headers.hasOwnProperty('Accept') ? headers : {...headers, 'Accept': 'application/json'};

const maybeConvertBodyToJSON = action => {
  const { payload } = action;
  if (shallConvertToJSON(payload.params)) {
    const body = JSON.stringify(payload.params.body);
    const headers = maybeAddAcceptHeader(payload.params.headers);
    const params = {...payload.params, body, headers};
    const result = {...action, payload: {...payload, params: params}};
    return result;
  } else {
    return action;
  }
};

export default fetchEncodeJSON;
