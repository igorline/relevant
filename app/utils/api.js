import * as tokenUtil from './token';

const routes = {};
let community;

console.log('BROWSER ', process.env.BROWSER);
console.log('WEB ', process.env.WEB);

if (process.env.BROWSER || process.env.WEB !== 'true') {
  // this is a weird hack that makes conditional require work in react-native
  // routes.post = require(postApi);
  // routes.user = require(userApi);
} else {
  // Desktop ONLY!!!
  // the if statment doesn't work anymore - user reat-native field in package.json
  // prevent react native from loading these modules
  const postApi = '../../server/api/post/post.controller';
  const userApi = '../../server/api/user/user.controller';
  // post = require(postApi);
  routes.post = require(postApi) || {}; // eslint-disable-line
  routes.user = require(userApi) || {}; // eslint-disable-line
}

const queryParams = params => {
  if (!params) return '';
  const paramString = Object.keys(params)
  .filter(p => params[p])
  .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
  .join('&');
  if (paramString && paramString.length) return '?' + paramString;
  return '';
};

export function setCommunity(_community) {
  community = _community;
}

export function env() {
  if (process.env.WEB !== 'true') {
    require('../publicenv');
    return process.env;
  }
  return process.env;
}

export function Alert() {
  if (process.env.WEB !== 'true') {
    const ReactNative = require('react-native');
    const Platform = ReactNative.Platform;
    if (Platform.OS === 'ios') {
      return ReactNative.AlertIOS;
    }
    return ReactNative.Alert;
  } else if (process.env.BROWSER) {
    return window;
  }
  return { alert: (a, b) => console.log(a, ' ', b) };
}

/**
 * send request to api
 * @param  {[type]} options
 * query - Object of url query params
 * params - url params
 * endpoint - api endpoint
 * uri - optional - custom url
 * method - REST method
 * body: body
 */
export async function request(options) {
  const query = queryParams({ ...options.query, community });
  let apiPath = '/api/';
  if (options.endpoint.match('auth')) apiPath = '';
  let uri = options.uri || process.env.API_SERVER + apiPath + options.endpoint;
  const path = options.path || '';
  uri += path;

  try {
    if (options.params) {
      Object.keys(options.params).forEach(key => {
        uri += '/' + options.params[key];
      });
    }

    let response;
    let responseJSON;

    // ---------------------------------------------
    // This is the case when request is orginating from nodejs
    // ---------------------------------------------

    if (!process.env.BROWSER && process.env.WEB === 'true') {
      if (options.path === '' && options.params) options.path = 'findById';
      const req = {
        params: options.params,
        body: options.body,
        query: options.query
      };
      const next = () => null;
      const res = null;
      responseJSON = await routes[options.endpoint][options.path](req, res, next);
      // in case we get a mongoose object back
      if (responseJSON && responseJSON.toObject) responseJSON = responseJSON.toObject();

      // ---------------------------------------------
      // This is the case when request is orginating from client
      // ---------------------------------------------
    } else {
      response = await fetch(uri + query, {
        method: options.method,
        ...(await exports.reqOptions()),
        body: options.body
      });
      response = await exports.handleErrors(response);
      responseJSON = await response.json();
    }
    // throw new Error('omg');
    return responseJSON;
  } catch (error) {
    console.log('api error', uri, error);
    throw error;
  }
}

export async function reqOptions() {
  try {
    const token = await tokenUtil.get();
    return {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    };
  } catch (err) {
    return {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    };
  }
}

export async function handleErrors(response) {
  if (!response.ok) {
    let error = response.statusText;
    try {
      const json = await response.json();
      if (json) {
        error = json.message;
        throw Error(error);
      }
    } catch (err) {
      throw Error(error);
    }
  }
  return response;
}
