import * as colors from 'app/styles/colors';
import * as layout from 'app/styles/layout';
import sizing, { size } from 'app/styles/sizing';
import * as fonts from 'app/styles/fonts';
import * as mixins from 'app/styles/mixins';
import * as screens from 'app/styles/screens';
import { responsiveHandler as responsive } from './responsive';

let GlobalStyle; // eslint-disable-line
if (process.env.WEB === 'true') {
  GlobalStyle = require('app/styles/baseStyles').GlobalStyle;
}

export const isNative = process.env.WEB !== 'true';

export { sizing, colors, layout, mixins, fonts, GlobalStyle, size, screens, responsive };
