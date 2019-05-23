import get from 'lodash.get';

export const URL_REGEX = new RegExp(
  // eslint-disable-next-line
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%_\+~#=]{2,256}\.[a-z]{2,10}\b([-a-zA-Z0-9@:%_\+~#?&//=]*)/g
);

export function getTitle({ post, link, firstPost, maxLength }) {
  let title =
    (link && get(link, 'title')) ||
    get(post, 'title') ||
    get(post, 'body') ||
    (firstPost && get(firstPost, 'body'));
  maxLength = maxLength || 160;
  if (title && title.length > maxLength) title = title.substring(0, maxLength) + '...';
  title = title && title.trim();
  return title;
}

export function getFavIcon(domain) {
  return `https://api.faviconkit.com/${domain}/144`;
  // return `https://s2.googleusercontent.com/s2/favicons?domain=${domain}`;
}
