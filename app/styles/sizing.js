let isNative = true;
if (process.env.WEB === 'true') {
  isNative = false;
}

export default {
  byUnit: (unit) => {
    if (!isNative) {
      return `${(unit * 7.2 / 10)}rem`;
    }
    return `${unit * 8}px`;
  }
};
