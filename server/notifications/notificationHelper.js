module.exports.getUrls = ({ post, fromUser, toUser }) => {
  const postId = post.parentPost ? post.parentPost._id || post.parentPost : post._id;
  const replyIdSting = post.parentPost ? `/${post._id}` : '';
  const userUrl = `${process.env.API_SERVER}/user/profile/${fromUser.handle}`;
  const postUrl = `${process.env.API_SERVER}/${
    post.data.community
  }/post/${postId}${replyIdSting}`;
  const settingsUrl = `${process.env.API_SERVER}/user/profile/${toUser.handle}/settings`;
  return { userUrl, postUrl, settingsUrl };
};
