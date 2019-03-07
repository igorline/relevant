export const required = value =>
  value || typeof value === 'number' ? undefined : 'Required';

export const email = value => {
  const re = /\S+@\S+\.\S+/;
  if (re.test(String(value).toLowerCase())) {
    return undefined;
  }
  return 'Not a valid e-mail';
};
