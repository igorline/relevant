
export function getText(activity, amount, coinAmount) {
  let action = 'increased';
  let also = 'also ';
  if (activity.amount < 0) {
    action = 'decreased';
    also = '';
  }

  switch (activity.type) {
    case 'upvote':
      let coinText = activity.coin ? 'you got a coin and ' : '';
      return `upvoted your post → ${coinText}your relevance increased by ${amount}`;

    case 'downvote':
      return `downvoted your post → your relevance decreased by ${amount}`;

    case 'partialUpvote':
      return `${also}upvoted this post → your relevance ${action} by ${amount}`;

    case 'partialDownvote':
      return `${also}downvoted this post → your relevance ${action} by ${amount}`;

    case 'basicIncome':
      return `You got ${activity.coin} extra coin${activity.coin > 1 ? 's' : ''} so you can upvote more posts!`;

    case 'commentAlso':
      return 'commented on a post';

    case 'comment':
      return 'commented on your post';

    case 'repost':
      return 'reposted your post';

    case 'postMention':
    case 'mention':
      return 'mentioned you in the post';

    case 'commentMention':
      return 'mentioned you in a comment';

    case 'topPost':
      return 'In case you missed this top-ranked post:';

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
  let post = activity.post;
  let image;
  let userName;

  switch (activity.type) {
    case 'upvote':
    case 'partialUpvote':
    case 'downvote':
    case 'partialDownvote':
      activity.byUser ? userImage = activity.byUser : emoji = '🤑';
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
