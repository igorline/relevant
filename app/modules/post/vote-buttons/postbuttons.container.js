import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { getPostType } from 'app/utils/post';
import { View, Image } from 'modules/styled/uni';
import { useCommunity } from 'modules/community/community.selectors';
import { sizing } from 'styles';
// import { CenterButton } from './center-button';
import PostButton from './postbutton';
import PostRank from './postrank';
import { useVoteAnimation, useCastVote } from './button.hooks';

const coinImage = require('app/public/img/relevantcoin.png');

PostButtons.propTypes = {
  auth: PropTypes.object,
  post: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    id: PropTypes.string,
    data: PropTypes.object,
    user: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    myVote: PropTypes.object,
    parentPost: PropTypes.string,
    type: PropTypes.string,
    url: PropTypes.string
  }),
  color: PropTypes.string,
  horizontal: PropTypes.bool
};

export default function PostButtons({ post, auth, color, horizontal }) {
  const investButton = useRef();
  const community = useCommunity();
  const { user } = auth;
  const canBet = getCanBet({ post, community, user });

  useVoteAnimation({ post, investButton, horizontal });
  const castVote = useCastVote({ auth, post, user, community, canBet });

  if (!post || post === 'notFound') return null;

  const tooltipData = getTooltipData(post);
  const voteStatus = getVoteStatus(user, post);

  return (
    <View
      ref={investButton}
      onLayout={() => {}}
      align="center"
      fdirection={horizontal ? 'row' : 'column'}
      style={{ opacity: 1 }} // need this to make animations work on android
    >
      <View>
        {canBet && (
          <Image
            w={1.6}
            h={1.6}
            position={'absolute'}
            style={{ top: sizing(-0.1), right: sizing(-0.4) }}
            source={coinImage}
          />
        )}
        <PostButton
          canBet={canBet}
          tooltipData={tooltipData}
          key={`${post.id}-up`}
          imageSet="UPVOTE"
          isActive={voteStatus.up}
          alt="upvote"
          color={color}
          onPress={e => castVote(e, voteStatus.vote, 1)}
        />
      </View>
      <PostRank horizontal={horizontal} color={color} post={post} />
      <PostButton
        tooltipData={tooltipData}
        key={`${post.id}-down`}
        imageSet="DOWNVOTE"
        isActive={voteStatus.down}
        alt="downvote"
        color={color}
        onPress={e => castVote(e, voteStatus.vote, -1)}
      />
    </View>
  );
  // <CenterButton post={post} horizontal={horizontal} votedUp={voteStatus.up} />
}

function getVoteStatus(user, post) {
  const ownPost = user && user._id === post.user;
  const vote = ownPost ? true : post.myVote;
  return {
    vote,
    up: vote && vote.amount > 0,
    down: vote && vote.amount < 0
  };
}

function getTooltipData(post) {
  const postType = getPostType({ post });
  const tipText =
    postType === 'link'
      ? 'Upvote articles that are worth reading, downvote spam.'
      : `Upvote quality ${postType}s and downvote spam`;

  return {
    text: tipText,
    position: 'right',
    desktopOnly: true
  };
}

function getCanBet({ post, community, user }) {
  if (!post) return false;
  const now = new Date();
  const bettingEnabled = community && community.betEnabled;
  const manualBet = user && user.notificationSettings.bet.manual;
  return (
    manualBet &&
    bettingEnabled &&
    post.data.eligibleForReward &&
    now.getTime() < new Date(post.data.payoutTime).getTime()
  );
}
