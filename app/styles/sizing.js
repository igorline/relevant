let isNative = true;
if (process.env.WEB === 'true') {
  isNative = false;
}

export default function(unit, type) {
  if (!isNative) {
    if (type) return `${unit}${type}`;
    return `${(unit * 7.2) / 10}rem`;
  }
  if (type) {
    if (unit < 0) return unit;
    return `${unit}${type}`;
  }
  if (unit < 0) return unit * 8;
  return `${unit * 8}px`;
}
