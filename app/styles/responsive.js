// This assumes we are working with 2 breakpoints/3 sizes
// export default
import { mediumScreenWidth, smallScreenWidth } from './layout';

let Dimensions;
let isNative = false;
let isServer = false;
let NATIVE_WIDTH;

if (process.env.WEB !== 'true') {
  isNative = true;
  Dimensions = require('react-native').Dimensions;
  const { width } = Dimensions.get('window');
  NATIVE_WIDTH = width;
}

if (!process.env.BROWSER) {
  isServer = true;
  Dimensions = require('react-native-web').Dimensions;
}

export const responsiveHandler = val => {
  if (!Array.isArray(val) || val.length === 1) return val[0];

  const WIDTH = getWidth();
  if (!WIDTH) return val[0];

  const breakpoints = [mediumScreenWidth, smallScreenWidth, 0];
  for (let i = 0; i < breakpoints.length; i++) {
    if (WIDTH >= breakpoints[i]) {
      if (val.length > i) return val[i];
      // return smallest available screen
      return val[val.length - 1];
    }
  }
  return null;
};

function getWidth() {
  try {
    if (isNative) return NATIVE_WIDTH;
    if (isServer) return Dimensions.get('window').width;
    return window.innerWidth;
  } catch (err) {
    return null;
  }
}
