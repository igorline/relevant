import get from 'lodash/get';
import { SLOPE, EXPONENT } from 'server/config/globalConstants';

export const URL_REGEX = new RegExp(
  // eslint-disable-next-line
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%_\+~#=]{2,256}\.[a-z]{2,10}\b([-a-zA-Z0-9@:%_\+~#?&//=]*)/g
);

export function getTitle({ post, link, maxLength }) {
  let title = (link && get(link, 'title')) || get(post, 'title');
  const fromBody = !title || title === '';
  title = title || get(post, 'body');

  const limit = maxLength || 160;
  if (fromBody) {
    const lines = title.split(/\n/);
    title = lines.slice(0, 1).join('\n');
    if (title.length <= limit) return title;
    return title.substr(0, title.lastIndexOf(' ', limit)) + '...';
  }

  if (title && title.length > limit) {
    title = title.substr(0, title.lastIndexOf(' ', limit)) + '...';
  }
  title = title && title.trim();
  return title;
}

export function getFavIcon(domain) {
  return `https://api.faviconkit.com/${domain}/144`;
  // return `https://s2.googleusercontent.com/s2/favicons?domain=${domain}`;
}

export const getPostUrl = (community, post) => {
  if (!post) return null;
  const { parentPost } = post;
  const postId = parentPost ? parentPost._id || parentPost : post._id || post;
  const commentId = parentPost ? '/' + (post._id || post) : '';
  return `/${community}/post/${postId}${commentId}`;
};

export const computeShares = ({ post, stakedTokens }) => {
  const { balance, shares: postShares } = post.data;
  const nexp = EXPONENT + 1;

  const shares =
    (((Math.max(balance, 0) + stakedTokens) / SLOPE) * nexp) ** (1 / nexp) -
    (postShares || 0);
  return shares;
};

export const getPostType = ({ post }) => {
  const type = !post.parentPost && post.url ? 'link' : post.type;
  return type;
};
