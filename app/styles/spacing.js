let isNative = true;
if (process.env.WEB === 'true') {
  isNative = false;
}

export default {
  spacing: (unit) => {
    if (isNative) {
      return `${(unit * 8 / 10)}rem`;
    }
    return `${unit * 8}px`;
  }
};
