// Expects unix timecode
const isTimecodeExpired = (date, days) => {
  const now = new Date().getTime();
  const diff = Math.abs(now - Number(date));
  const ONE_DAY = 1000 * 60 * 60 * 24;
  return diff > days * ONE_DAY;
};

export const isDismissed = (key, days) => {
  if (!window || !window.localStorage || !localStorage) {
    return false;
  }
  const dismissed = localStorage.getItem(key);
  if (!dismissed) {
    return false;
  }
  // const now = new Date().getTime();
  // const diff = Math.abs(now - Number(dismissed));
  // const ONE_DAY = 1000 * 60 * 60 * 24;
  // if (diff > days * ONE_DAY) {
  if (isTimecodeExpired(Number(dismissed), days)) {
    localStorage.removeItem(key);
    return false;
  }
  return true;
};
