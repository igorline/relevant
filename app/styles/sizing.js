import { responsiveHandler, getWidth } from './responsive';

let isNative = true;
if (process.env.WEB === 'true') {
  isNative = false;
}

const cache = {};

export default function sizing(unit, type) {
  if (!isNative) {
    if (type) return `${unit}${type}`;
    return `${unit / 2}rem`;
  }
  if (type) {
    if (unit < 0) return unit;
    return `${unit}${type}`;
  }
  if (unit < 0) return unit * 8;
  return `${unit * 8}px`;
}

export const size = value => {
  const w = getWidth();
  if (cache[w] && cache[w][value]) return cache[w][value];
  const units = responsiveHandler(value);

  if (typeof units === 'number') return sizing(units);
  if (!units || units.match(/px|rem|em|vh|vw|auto|%|pt/)) return units;
  const uArray = units.split(' ');
  if (uArray.length === 1) sizing(Number(units));
  const result = uArray.map(u => sizing(Number(u))).join(' ');
  if (!cache[w]) cache[w] = {};
  cache[w][value] = result;
  return result;
};
