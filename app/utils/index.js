import * as s3 from './s3';
import * as post from './post';
import * as api from './api';
import * as token from './token';
import * as numbers from './numbers';
import * as text from './text';
import * as img from './img';
import * as alert from './alert';

let transitionConfig = {}; // eslint-disable-line

if (process.env.WEB !== 'true') {
  transitionConfig = require('./transitionConfig').default;
}

export { s3, post, api, alert, token, numbers, text, transitionConfig, img };
