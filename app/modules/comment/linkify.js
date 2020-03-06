import Linkify from 'linkify-it';
import { isNative } from 'styles';

const linkify = Linkify();

export const linkifyMatch = text => linkify.match(text);

export default function linkifyText(text, community, omitUrl) {
  const matches = linkify.match(text);
  if (!matches) return text;
  let offset = 0;
  matches.forEach(match => {
    const { index, lastIndex, text: txt, url, schema } = match;
    const prependToUrl = schema === '#' && !isNative ? `/${community}` : '';
    // Already a link
    if (text[index - 1] === '(' && text[lastIndex] === ')') return;
    // Omit link if we have preview
    if (omitUrl && omitUrl[omitUrl.length - 1] === '/')
      omitUrl = omitUrl.substring(0, omitUrl.length - 1);
    const link = omitUrl && omitUrl === url ? '' : `[${txt}](${prependToUrl}${url}) `;
    text = text.slice(0, index + offset) + link + text.slice(lastIndex + offset);
    offset += link.length - (lastIndex - index);
  });
  return text;
}

linkify.add('@', {
  validate: (text, pos, self) => {
    const tail = text.slice(pos);

    if (!self.re.handle) {
      self.re.handle = new RegExp(
        '^([a-zA-Z0-9_]){1,15}(?!_)(?=$|' + self.re.src_ZPCc + ')'
      );
    }
    if (self.re.handle.test(tail)) {
      // Linkifier allows punctuation chars before prefix,
      // but we additionally disable `@` ("@@mention" is invalid)
      if (pos >= 2 && tail[pos - 2] === '@') {
        return false;
      }
      return tail.match(self.re.handle)[0].length;
    }
    return 0;
  },
  normalize: match => {
    isNative
      ? (match.url = '__user_profile__' + match.url.replace(/^@/, ''))
      : (match.url = '/user/profile/' + match.url.replace(/^@/, ''));
  }
});

linkify.add('#', {
  validate: (text, pos, self) => {
    const tail = text.slice(pos);

    if (!self.re.handle) {
      self.re.handle = new RegExp(
        '^([a-zA-Z0-9_]){1,15}(?!_)(?=$|' + self.re.src_ZPCc + ')'
      );
    }
    if (self.re.handle.test(tail)) {
      // Linkifier allows punctuation chars before prefix,
      // but we additionally disable `@` ("@@mention" is invalid)
      if (pos >= 2 && tail[pos - 2] === '@') {
        return false;
      }
      return tail.match(self.re.handle)[0].length;
    }
    return 0;
  },
  normalize: match => {
    isNative
      ? (match.url = '__tag_link__' + match.url.replace(/^#/, ''))
      : (match.url = `/new/` + match.url.replace(/^#/, ''));
  }
});
