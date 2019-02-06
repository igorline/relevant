import React from 'react';
import { numbers } from 'app/utils';
import Triangle from 'modules/icons/triangle.component';
import { View, BodyText } from 'modules/styled/uni';
import CoinStat from 'modules/stats/coinStat.component';

const ActivityText = ({ activity, amount }) => {
  let action = 'increased';
  let also = 'also ';
  let triangleDirection = 'UP';
  if (amount < 0) {
    action = 'decreased';
    also = '';
    triangleDirection = 'DOWN';
  }
  const postType = activity.post ? activity.post.type : 'post';
  const coin = numbers.abbreviateNumber(activity.coin);

  let text = null;
  switch (activity.type) {
    case 'upvote': {
      let relText = null;
      if (amount > 0) {
        relText = (
          <BodyText>
            {'→ your relevance increased by '}
            <Triangle direction={triangleDirection} />
            {` ${amount}%`}
          </BodyText>
        );
      }
      return (
        <View display="flex" direction="row">
          <BodyText>
            {`upvoted your ${postType}`}
            {relText}
          </BodyText>
        </View>
      );
    }

    // downvote, partialUpvote, partialDownvote basicIncome are deprecated
    case 'downvote':
      return (
        <View>
          <BodyText>
            {`downvoted your ${postType} → your relevance decreased by `}
            <Triangle direction={triangleDirection} />
            {` ${amount}%`}
          </BodyText>
        </View>);

    case 'partialUpvote':
      return (
        <View>
          <BodyText>
            {`${also}upvoted this ${postType} → your relevance ${action} by`}
            <Triangle direction={triangleDirection} />
            {` ${amount}%`}
          </BodyText>
        </View>
      );

    case 'partialDownvote':
      return (
        <View>
          <BodyText>
            {`${also}downvoted this ${postType} → your relevance ${action} by`}
            <Triangle direction={triangleDirection} />
            {` ${amount}%`}
          </BodyText>
        </View>

      );

    case 'basicIncome':
      text = `You got ${coin} extra coin${
        activity.coin > 1 ? 's' : ''
      } so you can upvote more posts!`;
      break;

    case 'commentAlso':
      text = `commented on a ${postType}`;
      break;

    case 'comment':
      text = 'commented on your post';
      break;

    case 'repost':
      text = 'reposted your post';
      break;

    case 'commentMention':
    case 'postMention':
    case 'mention':
      text = `mentioned you in the ${postType}`;
      break;

    // text = 'mentioned you in a comment';
    // break;

    case 'topPost':
      text = 'In case you missed this top-ranked post:';
      break;

    case 'reward':
      // text = `You earned ${coin} coins from this post`;
      return (
        <View display="flex" mr={1} ml={1}>
          <BodyText display="flex" align="center" >
            {'You earned'}
            <CoinStat size={2} lineHeight={2} amount={Number(coin)} mr={0.5} ml={0.5} align="center" />
            {'coins from this post.'}
          </BodyText>
        </View>
      );

    default:
      if (activity.text) {
        text = activity.text;
      }
  }
  return <BodyText>{text}</BodyText>;
};

export default ActivityText;
