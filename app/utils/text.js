
export function getMentions(words) {
  return words.map((word) => {
    if (word.match(/^@\S+/g)) {
      return word.replace('@', '').replace(/(,|\.)\s*$/, '');
    }
    return null;
  })
  .filter(el => el !== null);
}

export function getTags(words) {
  return words.map((word) => {
    if (word.match(/^#\S+/g)) {
      return word.replace('#', '').replace(/(,|\.)\s*$/, '');
    }
    return null;
  })
  .filter(el => el !== null);
}

export function getWords(text) {
  return text.replace((/(\.\s+)|(\.$)/g), a => '`' + a + '`')
  .replace((/[,!?\s+]/g), a => '`' + a + '`')
  .split(/`/);
}
