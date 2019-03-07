import { Alert } from 'app/utils/alert';

export function getMentions(words) {
  return words
  .map(word => {
    if (word.match(/^@\S+/g)) {
      return word.replace('@', '');
    }
    return null;
  })
  .filter(el => el !== null);
}

export function getTags(words) {
  return words
  .map(word => {
    if (word.match(/^#\S+/g)) {
      return word.replace('#', '');
    }
    return null;
  })
  .filter(el => el !== null);
}

export function getWords(text) {
  const res = text
  // .replace((/(\.\s+)|(\.$)/g), a => '`' + a + '`')
  .replace(/[,.!?](?!\b)|[\s+]/g, a => '`' + a + '`')
  .split(/`/);
  return res;
}

export const NAME_PATTERN = /^[a-zA-Z0-9-_]+$/;

// Android crashes when flag is separate argument w error:
// Cannot supply flags when constructing one RegExp from another
const HTML_REGEX = new RegExp(/<[^>]*>/gm);

export function stripHTML(text) {
  return (text || '').replace(HTML_REGEX, '');
}

export function copyToClipBoard(url) {
  const el = document.createElement('textarea');
  el.value = url;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  Alert().alert('Link copied to clip board ^_^', 'success');
}
