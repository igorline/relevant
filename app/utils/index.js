import * as s3 from './s3';
import * as post from './post';
import * as api from './api';
import * as storage from './storage';
import * as numbers from './numbers';
import * as text from './text';
import * as img from './img';
import * as alert from './alert';
import * as list from './list';
import * as tween from './tween';

let nav = {}; // eslint-disable-line

if (process.env.WEB !== 'true') {
  nav = require('./nav').default;
}

export { s3, post, api, alert, list, storage, numbers, text, nav, img, tween };
