import { getScreenSize } from 'app/utils/nav';

let isNative = true;
if (process.env.WEB === 'true') {
  isNative = false;
}

export default function(unit, type) {
  let screenSize = 0;
  try {
    screenSize = getScreenSize(window.innerWidth);
  } catch (e) {
    //
  }
  if (!isNative && screenSize === 0) {
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
