import * as tokenUtil from './token';

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
  let params = queryParams(options.params);
  let uri = options.uri || process.env.API_SERVER + '/api/' + options.endpoint;
  let path = options.path || '';
  try {
    let response = await fetch(uri + path + params, {
      method: options.method,
      ...await exports.reqOptions(),
      body: options.body
    });
    response = await exports.handleErrors(response);
    let responseJSON = await response.json();

    return responseJSON;
  } catch (error) {
    console.log('fetch error', uri, error);
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
