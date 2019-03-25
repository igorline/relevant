// This assumes we are working with 2 breakpoints/3 sizes
// export default

import { mediumScreenWidth, smallScreenWidth } from './layout';

export const responsiveHandler = (val, screen) => {
  if (!Array.isArray(val)) {
    return val;
  }

  if (screen && val.length > 0) return val[screen];

  let WIDTH;
  try {
    if (process.env.BROWSER === true) {
      WIDTH = window.innerWidth;
    } else {
      const { Dimensions } = require('react-native');
      const { width } = Dimensions.get('window');
      WIDTH = width;
    }
    if (!WIDTH) {
      return val[0];
    }
  } catch (e) {
    // console.log('CATCH');
    return val[0];
  }
  // const WIDTH = window.innerWidth;
  if (val.length === 1) {
    return val[0];
  }
  const breakpoints = [mediumScreenWidth, smallScreenWidth, 0];
  for (let i = 0; i < breakpoints.length; i++) {
    if (WIDTH >= breakpoints[i]) {
      if (val.length > i) {
        return val[i];
      } else if (val.length > i - 1) {
        return val[i - 1];
      }
    }
  }
  return null;
  // return val[0];
};
