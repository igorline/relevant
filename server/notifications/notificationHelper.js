module.exports.getUrls = ({ post, fromUser, toUser }) => {
  const postId = post.parentPost ? post.parentPost._id || post.parentPost : post._id;
  const replyIdSting = post.parentPost ? `/${post._id}` : '';
  const userUrl = fromUser
    ? `${process.env.API_SERVER}/user/profile/${fromUser.handle}`
    : null;
  const postUrl = `${process.env.API_SERVER}/${
    post.data ? post.data.community : post.community
  }/post/${postId}${replyIdSting}`;
  const settingsUrl = `${process.env.API_SERVER}/user/profile/${toUser.handle}/settings`;
  return { userUrl, postUrl, settingsUrl };
};
