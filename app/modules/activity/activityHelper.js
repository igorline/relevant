export function getStatParams(activity) {
  let { relevance, coin } = {};
  switch (activity.type) {
    case 'upvote':
    case 'partialUpvote':
    case 'downvote':
    case 'partialDownvote':
      relevance = true;
      break;
    case 'vote':
    case 'basicIncome':
      coin = true;
      break;
    default:
      if (activity.coin) coin = true;
  }

  return { relevance, coin };
}

export function getActivityParams(activity) {
  const { post } = activity;
  let emoji;
  let userImage;
  let image;
  let byUser;

  switch (activity.type) {
    case 'upvote':
    case 'partialUpvote':
    case 'downvote':
    case 'partialDownvote':
      if (activity.byUser) userImage = activity.byUser;
      else emoji = '🤑';
      byUser = activity.byUser;
      break;
    case 'basicIncome':
    case 'reward':
      emoji = '🤑';
      break;
    case 'topPost':
      image = require('app/public/img/r-emoji.png');
      break;
    default:
      userImage = activity.byUser;
      byUser = activity.byUser;
      break;
  }

  return { emoji, userImage, post, image, byUser };
}
