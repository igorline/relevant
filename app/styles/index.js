import * as colors from 'app/styles/colors';
import * as layout from 'app/styles/layout';
import sizing from 'app/styles/sizing';
import * as fonts from 'app/styles/fonts';

let GlobalStyle; // eslint-disable-line
if (process.env.WEB === 'true') {
  GlobalStyle = require('app/styles/baseStyles').GlobalStyle;
}

const mixins = {};

export {
  sizing,
  colors,
  layout,
  mixins,
  fonts,
  GlobalStyle,
};
