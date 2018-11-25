import * as tokenUtil from './token';

let post;
let routes = {};
let community;

// let postApi = '';
// let userApi = '';

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
  let postApi = '../../server/api/post/post.controller';
  let userApi = '../../server/api/user/user.controller';
  // post = require(postApi);
  routes.post = require(postApi) || {};
  routes.user = require(userApi) || {};
}

const queryParams = (params) => {
  if (!params) return '';
  let paramString = Object.keys(params)
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
    let ReactNative = require('react-native');
    let Platform = ReactNative.Platform;
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
  let query = queryParams({ ...options.query, community });
  let apiPath = '/api/';
  if (options.endpoint.match('auth')) apiPath = '';
  let uri = options.uri || process.env.API_SERVER + apiPath + options.endpoint;
  let path = options.path || '';
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
      let req = {
        params: options.params,
        body: options.body,
        query: options.query,
      };
      let next = () => null;
      let res = null;
      responseJSON = await routes[options.endpoint][options.path](req, res, next);
      // in case we get a mongoose object back
      if (responseJSON && responseJSON.toObject) responseJSON = responseJSON.toObject();

    // ---------------------------------------------
    // This is the case when request is orginating from client
    // ---------------------------------------------
    } else {
      response = await fetch(uri + query, {
        method: options.method,
        ...await exports.reqOptions(),
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
  let token;
  try {
    token = await tokenUtil.get();
  } catch (err) {
    console.log('no token');
  }
  return {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  };
}

export async function handleErrors(response) {
  if (!response.ok) {
    let error = response.statusText;
    try {
      let json = await response.json();
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
