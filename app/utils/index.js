import * as s3 from './s3';
import * as post from './post';
import * as api from './api';
import * as token from './token';
import * as numbers from './numbers';
import * as text from './text';
import * as img from './img';
import * as alert from './alert';
import * as list from './list';
import * as routing from './routing';
import * as localStorage from './localStorage';

let nav = {}; // eslint-disable-line

if (process.env.WEB !== 'true') {
  nav = require('./nav').default;
}

export {
  s3,
  post,
  api,
  alert,
  list,
  token,
  numbers,
  localStorage,
  text,
  nav,
  img,
  routing
};
