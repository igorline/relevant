export function percentChange(user) {
  let percent = 0;
  if (user.relevanceRecord && user.relevanceRecord[1]) {
    let last = user.relevanceRecord[1];
    let oldRel = last.relevance;
    percent = ((user.relevance - oldRel) * 100) / oldRel;
    let timeInteraval = new Date() - new Date(last.time);
    let scale = ( 1 * 24 * 60 * 60 * 1000) / timeInteraval;
    percent *= scale;
    if (percent < 10) percent = Math.round(percent * 10) / 10;
    else if (percent < 1) percent = Math.round(percent * 100) / 100;
    else percent = Math.round(percent);
  }
  return percent;
}

export function abbreviateNumber(num) {
  let fixed = 0;
  if (num === null) { return null; } // terminate early
  if (num === 0) { return '0'; } // terminate early
  if (typeof num !== 'number') num = Number(num);
  fixed = (!fixed || fixed < 0) ? 0 : fixed; // number of decimal places to show
  let b = (num).toPrecision(2).split('e'); // get power
  let k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3); // floor at decimals, ceiling at trillions
  let c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3) ).toFixed(1 + fixed); // divide by power
  let d = c < 0 ? c : Math.abs(c); // enforce -0 is 0
  let e = d + ['', 'K', 'M', 'B', 'T'][k]; // append power
  return e;
}

export function timeSince(date) {
  let seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval + 'y';
  }
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval + 'mo';
  }
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval + 'd';
  }
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval + 'hr';
  }
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval + 'm';
  }
  return Math.floor(seconds) + 's';
}

export function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16 | 0;
    let v = c === 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}
