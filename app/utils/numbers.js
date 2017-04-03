export function percentChange(user) {
  let totalPercent = 0;

  if (!user || !user.relevanceRecord || !user.relevanceRecord.length) return 0;

  user.relevanceRecord.forEach((record, i) => {
    let percent = 0;
    let endInterval = new Date();
    let endRelevance = user.relevance;
    let last = record;
    let oldRel = Math.abs(last.relevance);
    if (oldRel === 0) return;
    percent = ((endRelevance - oldRel) * 100) / oldRel;
    let timeInteraval = endInterval - new Date(last.time);
    let scale = (1 * 24 * 60 * 60 * 1000) / timeInteraval;
    percent *= scale;
    totalPercent += percent;
  });

  let total = totalPercent / user.relevanceRecord.length;
  // if (total < 10) total = Math.round(total * 10) / 10;
  // else if (total < 1) total = Math.round(total * 100) / 100;
  // else total = Math.round(total);

  return total;

  // let percent = 0;
  // if (user.relevanceRecord && user.relevanceRecord[0]) {
  //   let last = user.relevanceRecord[0];
  //   let oldRel = last.relevance;
  //   percent = ((user.relevance - oldRel) * 100) / oldRel;
  //   let timeInteraval = new Date() - new Date(last.time);
  //   let scale = ( 1 * 24 * 60 * 60 * 1000) / timeInteraval;
  //   percent *= scale;
  //   if (percent < 10) percent = Math.round(percent * 10) / 10;
  //   else if (percent < 1) percent = Math.round(percent * 100) / 100;
  //   else percent = Math.round(percent);
  // }
  // return percent;
}

export function abbreviateNumber(num) {
  let fixed = 0;
  if (Math.abs(num) < 10) fixed = 1;
  if (Math.abs(num) < 1) fixed = 2;
  if (num === null) { return null; } // terminate early
  if (num === 0) { return '0'; } // terminate early
  if (typeof num !== 'number') num = Number(num);
  fixed = (!fixed || fixed < 0) ? 0 : fixed; // number of decimal places to show
  let b = (num).toPrecision(2).split('e'); // get power
  let k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3); // floor at decimals, ceiling at trillions
  let c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3)).toFixed(1 + fixed); // divide by power
  let d = c < 0 ? -Math.abs(c) : Math.abs(c); // enforce -0 is 0 and trim .00s
  let e = d + ['', 'K', 'M', 'B', 'T'][k]; // append power
  return e;
}

export function timeSince(date) {
  let d = new Date(date);
  console.log(d.toString());
  console.log(Date.now().toString());
  let seconds = Math.floor((new Date() - d) / 1000);
  let interval = Math.floor(seconds / 31536000);
  let s;
  if (interval >= 1) {
    return interval + 'y';
  }
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval + 'm';
  }
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval + 'd';
  }
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval + 'h';
  }
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval + 'min';
  }
  return Math.floor(seconds) + 'sec';
}

export function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16 | 0;
    let v = c === 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}
