import { numbers } from '../../utils';

export function getText(activity, amount) {
  let action = 'increased';
  let also = 'also ';
  if (amount < 0) {
    action = 'decreased';
    also = '';
  }
  const postType = activity.post ? activity.post.type : 'post';
  const coin = numbers.abbreviateNumber(activity.coin);

  switch (activity.type) {
    case 'upvote': {
      // coinText is deprecated
      const coinText = activity.coin ? 'you got a coin and ' : '';
      const relText = amount > 0 ? `→ ${coinText}your relevance increased by ${amount}` : '';
      return `upvoted your ${postType} ${relText}`;
    }

    // downvote, partialUpvote, partialDownvote basicIncome are deprecated
    case 'downvote':
      return `downvoted your ${postType} → your relevance decreased by ${amount}`;

    case 'partialUpvote':
      return `${also}upvoted this ${postType} → your relevance ${action} by ${amount}`;

    case 'partialDownvote':
      return `${also}downvoted this ${postType} → your relevance ${action} by ${amount}`;

    case 'basicIncome':
      return `You got ${coin} extra coin${
        activity.coin > 1 ? 's' : ''
      } so you can upvote more posts!`;

    case 'commentAlso':
      return `commented on a ${postType}`;

    case 'comment':
      return 'commented on your post';

    case 'repost':
      return 'reposted your post';

    case 'commentMention':
    case 'postMention':
    case 'mention':
      return `mentioned you in the ${postType}`;

    // return 'mentioned you in a comment';

    case 'topPost':
      return 'In case you missed this top-ranked post:';

    case 'reward':
      return `You earned ${coin} coins from this post`;

    default:
      if (activity.text) return activity.text;
      return null;
  }
}

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
  let emoji;
  let userImage;
  const post = activity.post;
  let image;
  let userName;

  switch (activity.type) {
    case 'upvote':
    case 'partialUpvote':
    case 'downvote':
    case 'partialDownvote':
      if (activity.byUser) userImage = activity.byUser;
      else emoji = '🤑';
      userName = activity.byUser;
      break;
    case 'basicIncome':
    case 'reward':
      emoji = '🤑';
      break;
    case 'topPost':
      image = 'r-emoji.png';
      break;
    default:
      userImage = activity.byUser;
      userName = activity.byUser;
      break;
  }

  return { emoji, userImage, post, image, userName };

  // TODO rework native
  // return (
  //   <View style={styles.activityLeft}>
  //     <View style={styles.activityLeft}>
  //       {userImage ? renderLeftImage(userImage) : null }
  //       {image ? renderLeftImage(image) : null }
  //       {emoji ?
  //         <Text allowFontScaling={false} style={styles.incomeEmoji}>
  //           {emoji}
  //         </Text> : null
  //       }
  //       <Text style={[{ flex: 1 }, styles.activityText]}>
  //         {userName ? renderName(userName) : null}
  //         {getText()}
  //       </Text>
  //       {post ? renderPost(activity.post) : null}
  //     </View>
  //   </View>
  // );
}
