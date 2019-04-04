import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
// import moment from 'moment';

dayjs.extend(relativeTime);

export function toNumber(num, dec) {
  if (num === undefined || dec === undefined) return null;
  return num / 10 ** dec;
}

export function toFixed(num, dec) {
  if (!num) return 0;
  return num.toFixed(dec);
}

export function percentChange(user) {
  let totalPercent = 0;

  if (!user || !user.relevanceRecord || !user.relevanceRecord.length) return 0;

  user.relevanceRecord.forEach(record => {
    let percent = 0;
    const endInterval = new Date();
    const endRelevance = user.pagerank;
    const last = record;
    const oldRel = Math.abs(last.relevance);
    if (oldRel === 0) return;
    percent = ((endRelevance - oldRel) * 100) / oldRel;
    const timeInteraval = endInterval - new Date(last.time);
    const scale = (1 * 24 * 60 * 60 * 1000) / timeInteraval;
    percent *= scale;
    totalPercent += percent;
  });

  const total = totalPercent / user.relevanceRecord.length;
  return total;
}

export function abbreviateNumber(num, _fixed) {
  let fixed = 0;
  if (Math.abs(num) < 100) fixed = 1;
  if (Math.abs(num) < 10) fixed = 1;
  if (Math.abs(num) < 1) fixed++;
  if (Math.abs(num) < 0.1) fixed++;
  if (Math.abs(num) < 0.01) fixed++;
  if (Math.abs(num) < 0.001) fixed++;

  if (typeof _fixed === 'number') fixed = _fixed;
  if (num === null) {
    return null;
  } // terminate early
  if (num === 0) {
    return '0';
  } // terminate early
  if (typeof num !== 'number') num = Number(num);
  fixed = !fixed || fixed < 0 ? 0 : fixed; // number of decimal places to show
  const b = num.toPrecision(2).split('e'); // get power
  // floor at decimals, ceiling at trillions
  const k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3);
  // divide by power
  const c = k < 1 ? num.toFixed(0 + fixed) : (num / 10 ** (k * 3)).toFixed(2 + fixed);
  const d = c < 0 ? -Math.abs(c) : Math.abs(c); // enforce -0 is 0 and trim .00s
  const e = d + ['', 'K', 'M', 'B', 'T'][k]; // append power
  return e;
}

export function capitalize(string) {
  return string
  .split(' ')
  .map(s => s.charAt(0).toUpperCase() + s.slice(1))
  .join(' ');
}

export function getTimestamp(date) {
  if (!date) return null;
  const fromNow = dayjs(date).fromNow();
  return ' • ' + capitalize(fromNow);
}

export function getMonth(date) {
  if (!date) return null;
  return dayjs(date).format('MMMM');
}

export function getDayMonthYearTimestamp(date) {
  if (!date) return null;
  return dayjs(date).format('MMM D, YYYY');
}

export function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0; // eslint-disable-line
    const v = c === 'x' ? r : (r & 0x3) | 0x8; // eslint-disable-line
    return v.toString(16);
  });
}
