export const getPostUrl = (community, post) => {
  if (!post) return null;
  const type = post.type === 'chat' || post.channel ? 'channel' : 'post';
  const id = post._id ? post._id : post;
  return `/${community}/${type}/${id}`;
};
