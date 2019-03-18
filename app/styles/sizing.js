import { mediumScreenWidth } from './layout';

let isNative = true;
if (process.env.WEB === 'true') {
  isNative = false;
}

export default function(unit, type) {
  let isResponsive = false;
  try {
    if (window.innerWidth <= mediumScreenWidth) {
      isResponsive = true;
    }
  } catch (e) {
    //
  }
  if (!isNative || isResponsive) {
    if (type) return `${unit}${type}`;
    return `${unit * 7.2}px`;
  }
  if (type) {
    if (unit < 0) return unit;
    return `${unit}${type}`;
  }
  if (unit < 0) return unit * 8;
  return `${unit * 8}px`;
}
