export const getPostUrl = (community, post) => {
  if (!post) return null;
  return `/${community}/post/${post._id ? post._id : post}`;
};
