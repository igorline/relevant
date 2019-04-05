export function unique(array) {
  return array.filter((elem, pos, arr) => arr.indexOf(elem) === pos);
}
