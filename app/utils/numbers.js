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
  if (typeof num !== 'number') return num;
  let fixed = 0;

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
  const newNum = k < 1 ? num : num / 10 ** (k * 3);
  if (Math.abs(newNum) < 100) fixed = 1;
  if (Math.abs(newNum) < 10) fixed = 1;
  if (Math.abs(newNum) < 1) fixed++;
  if (Math.abs(newNum) < 0.1) fixed++;
  if (Math.abs(newNum) < 0.01) fixed++;
  if (Math.abs(newNum) < 0.001) fixed++;

  const c = newNum.toFixed(fixed);
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

export function getTimestamp(date, withoutSuffix) {
  if (!date) return null;
  const fromNow = dayjs(date).fromNow(withoutSuffix);
  return capitalize(fromNow);
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

export function timeLeft({ _date, index }) {
  const now = new Date();
  const date = new Date(_date);
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);

  const d = 0;
  // const d = Math.round(seconds / (3600 * 24));
  const h = Math.round(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  const s = seconds % 60;
  const abr = ['hr', 'min', 'sec'];
  const data = [h > 9 ? h : d ? h : h || '0', m > 9 ? m : d && h ? m : m || '0', s]
    .map((t, i) => (t ? t + abr[i] : null))
    .filter(t => t);

  if (index) return data[index - 1];
  return data.join(':');
}

export function timeLeftTick(_date) {
  const now = new Date();
  const date = new Date(_date);
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);

  const d = Math.round(seconds / (3600 * 24));
  const h = Math.round((seconds % 24) / 3600);
  const m = Math.round((seconds % 3600) / 60);
  const s = seconds % 60;
  const abr = [` day${d > 1 ? 's' : ''} `, ':', ':', ''];
  const fmtT = t => (t < 10 ? '0' + t : t || '00');
  const data = [d, fmtT(h), fmtT(m), fmtT(s)]
    .map((t, i) => (t ? t + abr[i] : null))
    .filter(t => t);

  return data.join('');
}
