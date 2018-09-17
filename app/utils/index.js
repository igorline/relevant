import * as s3 from './s3';
import * as post from './post';
import * as api from './api';
import * as token from './token';
import * as numbers from './numbers';
import * as text from './text';

let transitionConfig = {};

if (process.env.WEB != 'true') {
  transitionConfig = require('./transitionConfig').default;
}

export {
  s3,
  post,
  api,
  token,
  numbers,
  text,
  transitionConfig
};
