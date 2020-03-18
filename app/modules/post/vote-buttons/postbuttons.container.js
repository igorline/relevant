import React, { useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { getPostType } from 'app/utils/post';
import { View, Image } from 'modules/styled/uni';
import { useCommunity } from 'modules/community/community.selectors';
import { sizing } from 'styles';
import PostButton from './postbutton';
import PostRank from './postrank';
import { useVoteAnimation, useCastVote } from './button.hooks';

const coinImage = require('app/public/img/relevantcoin.png');

PostButtons.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    id: PropTypes.string,
    data: PropTypes.object,
    user: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    myVote: PropTypes.object,
    parentPost: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    type: PropTypes.string,
    url: PropTypes.string
  }),
  color: PropTypes.string,
  horizontal: PropTypes.bool
};

export default memo(PostButtons);

function PostButtons({ post, color, horizontal }) {
  const investButton = useRef();
  const community = useCommunity();
  const user = useSelector(state => state.auth.user);
  const canBet = getCanBet({ post, community, user });

  useVoteAnimation({ post, investButton, horizontal });
  const castVote = useCastVote({ post, user, community, canBet });

  const tooltipData = getTooltipData(post);
  const voteStatus = getVoteStatus(user, post);
  if (!post || post === 'notFound') return null;

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
    post.data &&
    post.data.eligibleForReward &&
    now.getTime() < new Date(post.data.payoutTime).getTime()
  );
}
