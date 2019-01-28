let isNative = true;
if (process.env.WEB === 'true') {
  isNative = false;
}

export default function(unit) {
  if (!isNative) {
    return `${(unit * 7.2)}px`;
  }
  return `${unit * 8}px`;
}

