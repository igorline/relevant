import * as storage from './storage';

const routes = {};
const IS_SERVER = !process.env.BROWSER && process.env.WEB === 'true';
const IS_CLIENT = !IS_SERVER;

// TODO this should be somewhere else!
export const env = () => {
  if (process.env.WEB !== 'true') {
    require('../publicenv');
    return process.env;
  }
  return process.env;
};
env();

const API_URL = process.env.API_SERVER;

if (IS_CLIENT) {
  // this is a weird hack that makes conditional require work in react-native
} else {
  // Desktop ONLY!!!
  // use react-native field in package.json
  // this will prevent react native from loading these modules
  const postApi = '../../server/api/post/post.controller';
  const userApi = '../../server/api/user/user.controller';
  const commentsApi = '../../server/api/comment/comment.controller';
  const feedApi = '../../server/api/communityFeed/communityFeed.controller';
  const communityApi = '../../server/api/community/community.controller';

  routes.comment = require(commentsApi) || {}; // eslint-disable-line
  routes.communityFeed = require(feedApi) || {}; // eslint-disable-line
  routes.post = require(postApi) || {}; // eslint-disable-line
  routes.user = require(userApi) || {}; // eslint-disable-line
  routes.community = require(communityApi) || {}; // eslint-disable-line
}

// Deprecated remove from code
export const setCommunity = () => {};

export const request = options => (dispatch, getState) => _request(options, getState);

/**
 * send request to api
 * @param  {[type]} options
 * query - Object of url query params
 * params - url params
 * endpoint - api endpoint (user / post etc)
 * path - speicifi api call (default is index)
 * uri - optional - custom url
 * method - REST method
 * body: body
 */
export async function _request(options, getState) {
  try {
    // Add community query parameter
    const state = getState();
    const community = state.community.active;
    const query = { community, ...options.query };
    const params = { ...options, query };

    // ---------------------------------------------
    // This is the case when request is orginating from nodejs
    // ---------------------------------------------
    if (IS_SERVER) return getDataOnServer(params);

    // ---------------------------------------------
    // This is the case when request is orginating from client
    // ---------------------------------------------
    return getDataFromClient(params);
  } catch (error) {
    // console.log('api error', uri, error);
    throw error;
  }
}

async function getDataFromClient(params) {
  const uri = constructUri(params);
  const queryString = queryParams(params.query);
  const response = await fetch(uri + queryString, {
    method: params.method,
    ...(await reqOptions()),
    body: params.body
  });
  const responseOk = await handleErrors(response);
  return responseOk.json();
}

async function getDataOnServer(params) {
  const path = params.path || '';
  if (path === '') params.path = 'index';
  const req = {
    params: params.params,
    body: params.body,
    query: params.query,
    user: params.user
  };
  const next = () => null;
  const res = null;
  if (!routes[params.endpoint] || !routes[params.endpoint][params.path]) {
    return null;
  }
  const resJSON = await routes[params.endpoint][params.path](req, res, next);

  // convert to object in case we get a mongoose object back
  return resJSON && resJSON.toObject ? res.toObject() : resJSON;
}

function constructUri(options) {
  const rootUrl = options.uri || API_URL;
  const apiPath = options.endpoint.match('auth') ? '' : '/api/';
  const path = options.path || '';
  const params = options.params
    ? Object.keys(options.params).reduce((a, key) => a + '/' + options.params[key], '')
    : '';
  return rootUrl + apiPath + options.endpoint + path + params;
}

export async function reqOptions() {
  try {
    const token = await storage.getToken();
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

export const queryParams = params => {
  if (!params) return '';
  const paramString = Object.keys(params)
    .filter(p => params[p])
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
    .join('&');
  if (paramString && paramString.length) return '?' + paramString;
  return '';
};

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
