import { isArray, isPlainObject } from 'lodash';
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
  if (typeof keys === 'string') keys = keys.split(' ');
  keys = [...defaultKeys, ...(keys || [])];
  const reducer = (result, key) => {
    const val = result[key];
    if (!val || isArray(val)) return result;
    if (isPlainObject(val)) return set(key, sanitize(val, keys), result);
    if (keys.includes(key)) return set(key, '[SANITIZED]', result);
    return result;
  };
  return Object.keys(data).reduce(reducer, data);
}
