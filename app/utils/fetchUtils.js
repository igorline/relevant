'use strict';
import * as tokenUtil from './token';

let post;
let routes = {};

if (process.env.BROWSER || process.env.WEB !== 'true') {
  // this is a weird hack that makes conditional require work in react-native
} else {
  console.log('LOAD NODE DIRECT ROUTER');
  let n = '../../server/api/post/post.controller';
  post = require(n);
  routes.post = post;
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


export function env() {
  if (process.env.WEB != 'true') {
    require('../publicenv');
    return process.env;
  }
  return process.env;
}

export function Alert() {
  if (process.env.WEB != 'true') {
    let Platform = require('react-native').Platform;
    if (Platform.OS === 'ios') {
      return require('react-native').AlertIOS;
    }
    return require('react-native').Alert;
  } else if (process.env.BROWSER) {
    return window;
  }
  return { alert: (a, b) => console.log(a, ' ', b) };
}

/**
 * [superFetch description]
 * @param  {[type]} options
 * params - Object of url query params
 * endpoint - api endpoint
 * uri - optional - custom url
 * method - REST method
 * body: body
 */
export async function superFetch(options) {
  // TODO rename to options.query to match node
  let params = queryParams(options.params);
  let uri = options.uri || process.env.API_SERVER + '/api/' + options.endpoint;
  let path = options.path || '';
  uri += path;
  // TODO rename to options.params to match node
  if (options.pathParams) {
    Object.keys(options.pathParams).forEach(key => {
      uri += '/' + options.pathParams[key];
    });
  }

  try {
    let response;
    let responseJSON;
    // This is the case when request is orginating from nodejs
    if (!process.env.BROWSER && process.env.WEB === 'true') {
      if (options.path === '' && options.pathParams) options.path = 'findById';
      let req = {
        params: options.pathParams,
        body: options.body,
        query: options.params,
      };
      let next = () => null;
      let res = null;
      responseJSON = await routes[options.endpoint][options.path](req, res, next);
      // in case we get a mongoose object back
      if (responseJSON && responseJSON.toObject) responseJSON = responseJSON.toObject();
    } else {
      response = await fetch(uri + params, {
        method: options.method,
        ...await exports.reqOptions(),
        body: options.body
      });
      response = await exports.handleErrors(response);
      responseJSON = await response.json();
    }
    return responseJSON;
  } catch (error) {
    console.log('superFetch error', uri, error);
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
