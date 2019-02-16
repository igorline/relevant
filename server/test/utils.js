import { isArray, isPlainObject, concat } from 'lodash';
import { set } from 'lodash/fp';

const defaultKeys = [
  '_id',
  'id',
  'createdAt',
  'updatedAt',
  'payoutTime',
  'postDate',
  'latestComment',
  'rank'
];

export function sanitize(data, keys = defaultKeys) {
  if (!data) return data;
  if (typeof keys === 'string') keys = keys.split(' ');
  keys = concat(defaultKeys, keys);
  const reducer = (result, key) => {
    const val = result[key];
    if (!val) return result;
    if (isArray(val)) return set(key, val.map(r => sanitize(r, keys)), result);
    if (isPlainObject(val)) return set(key, sanitize(val, keys), result);
    if (keys.includes(key)) return set(key, '[SANITIZED]', result);
    return result;
  };
  return Object.keys(data).reduce(reducer, data);
}

export function toObject(data) {
  if (!data) return data;
  if (isArray(data)) return data.map(toObject);
  if (data.constructor && data.constructor.name === 'model') {
    return data.toObject();
  }
  if (isPlainObject(data)) {
    const newData = {};
    Object.keys(data).forEach(k => (newData[k] = toObject(data[k])));
    return newData;
  }
  return data;
}
