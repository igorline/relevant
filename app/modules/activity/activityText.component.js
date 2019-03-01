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
          <BodyText inline={1}>
            {' → your reputation increased by '}
            <Triangle inline={1} direction={triangleDirection} />
            &nbsp;
            {`${amount}%`}
          </BodyText>
        );
      }
      return (
        <BodyText inline={1}>
          {`upvoted your ${postType}`}
          {relText}
        </BodyText>
      );
    }

    // downvote, partialUpvote, partialDownvote basicIncome are deprecated
    case 'downvote':
      return (
        <BodyText inline={1}>
          {`downvoted your ${postType} → your reputation decreased by `}
          <Triangle inline={1} direction={triangleDirection} />
          {` ${amount}%`}
        </BodyText>
      );

    case 'partialUpvote':
      return (
        <Text inline={1}>
          <BodyText inline={1}>
            {`${also}upvoted this ${postType} → your reputation ${action} by `}
            <Triangle inline={1} direction={triangleDirection} />
            {` ${amount}%`}
          </BodyText>
        </Text>
      );

    case 'partialDownvote':
      return (
        <Text inline={1}>
          <BodyText inline={1}>
            {`${also}downvoted this ${postType} → your reputation ${action} by `}
            <Triangle inline={1} direction={triangleDirection} />
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
      text = `commented on this ${postType}`;
      break;

    case 'comment':
      text = 'replied to your comment';
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
        <Text inline={1} align="baseline">
          <BodyText inline={1}>{'You earned '}</BodyText>
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
          <BodyText inline={1}>{' coins from upvoting this post'}</BodyText>
        </Text>
      );

    case 'reward_twitter':
    case 'reward_email':
      text =
        activity.type === 'reward_twitter'
          ? 'connecting your Twitter account'
          : 'verifying your email';
      return (
        <Text inline={1} align="baseline">
          <BodyText inline={1}>{'You got '}</BodyText>
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
          <BodyText inline={1}>{` coins for ${text}`}</BodyText>
        </Text>
      );

    case 'reward_referral':
      return (
        <Text inline={1} align="baseline">
          <BodyText inline={1}>{'signed up via your invite link, you got '}</BodyText>
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
          <BodyText inline={1}>{' coins for your referral'}</BodyText>
        </Text>
      );

    case 'reward_referredBy':
      return (
        <Text inline={1} align="baseline">
          <BodyText inline={1}>
            {"gave you a referral, so you're getting started with an extra "}
          </BodyText>
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
          <BodyText inline={1}>{' coins and some reputation!'}</BodyText>
        </Text>
      );

    default:
      if (activity.text) {
        text = activity.text;
      }
  }
  return <BodyText inline={1}>{text}</BodyText>;
};

ActivityText.propTypes = {
  activity: PropTypes.object,
  amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default ActivityText;
