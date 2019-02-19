import React from 'react';
import PropTypes from 'prop-types';
import { numbers } from 'app/utils';
import Triangle from 'modules/icons/triangle.component';
import { BodyText, Text } from 'modules/styled/uni';
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
          <BodyText inline>
            {' → your relevance increased by '}
            <Triangle inline direction={triangleDirection} />
            &nbsp;
            {`${amount}%`}
          </BodyText>
        );
      }
      return (
        <BodyText inline>
          {`upvoted your ${postType}`}
          {relText}
        </BodyText>
      );
    }

    // downvote, partialUpvote, partialDownvote basicIncome are deprecated
    case 'downvote':
      return (
        <BodyText inline>
          {`downvoted your ${postType} → your relevance decreased by `}
          <Triangle direction={triangleDirection} />
          {` ${amount}%`}
        </BodyText>
      );

    case 'partialUpvote':
      return (
        <Text inline>
          <BodyText>
            {`${also}upvoted this ${postType} → your relevance ${action} by`}
            <Triangle direction={triangleDirection} />
            {` ${amount}%`}
          </BodyText>
        </Text>
      );

    case 'partialDownvote':
      return (
        <Text inline>
          <BodyText inline>
            {`${also}downvoted this ${postType} → your relevance ${action} by`}
            <Triangle direction={triangleDirection} />
            {` ${amount}%`}
          </BodyText>
        </Text>
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
      text = 'In case you missed this top-ranked post';
      break;

    case 'reward':
      // text = `You earned ${coin} coins from this post`;
      return (
        <Text inline align="baseline">
          <BodyText inline>{'You earned '}</BodyText>
          <CoinStat
            inline
            size={1.75}
            lh={1.75}
            amount={Number(coin)}
            mr={0}
            ml={0}
            slef={'flex-end'}
            align="baseline"
          />
          <BodyText inline>{' coins from this post'}</BodyText>
        </Text>
      );

    default:
      if (activity.text) {
        text = activity.text;
      }
  }
  return <BodyText>{text}</BodyText>;
};

ActivityText.propTypes = {
  activity: PropTypes.object,
  amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default ActivityText;
