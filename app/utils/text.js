
export function getMentions(words) {
  return words.map((word) => {
    if (word.match(/^@\S+/g)) {
      return word.replace('@', '');
    }
    return null;
  })
  .filter(el => el !== null);
}

export function getTags(words) {
  return words.map((word) => {
    if (word.match(/^#\S+/g)) {
      return word.replace('#', '');
    }
    return null;
  })
  .filter(el => el !== null);
}

export function getWords(text) {
  let res = text
  // .replace((/(\.\s+)|(\.$)/g), a => '`' + a + '`')
  .replace((/[,.!?](?!\b)|[\s+]/g), a => '`' + a + '`')
  .split(/`/);
  return res;
}

const HTML_REGEX = new RegExp(/<[^>]*>/, 'gm');

export function stripHTML(text) {
  return (text || '').replace(HTML_REGEX, '');
}
