export const HELLO = 'server/hello';

export function hello(value) {
  return {
    type: HELLO,
    payload: value
  };
};
