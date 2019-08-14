import React, { useRef, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { browserAlerts } from 'app/utils/alert';
import { getPostType } from 'app/utils/post';
import PostButton from 'modules/post/postbutton.component';
import { View, NumericalValue } from 'modules/styled/uni';
import { colors } from 'app/styles';
import { triggerAnimation } from 'modules/animation/animation.actions';
import { useCommunity } from 'modules/community/community.selectors';
import Tooltip from 'modules/tooltip/tooltip.component';
import { CenterButton } from './postbuttonCenter';
import { vote as voteAction } from './invest.actions';

let Analytics;
let ReactGA;
if (process.env.WEB !== 'true') {
  Analytics = require('react-native-firebase-analytics');
} else {
  ReactGA = require('react-ga').default;
}

PostButtons.propTypes = {
  auth: PropTypes.object,
  post: PropTypes.shape({
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
  const dispatch = useDispatch();
  const investButton = useRef();
  const [processingVote, setProcessingVote] = useState(false);
  const community = useCommunity();

  const castVote = useCallback(
    async (e, vote, amount) => {
      try {
        const type = amount > 0 ? 'upvote' : 'downvote';
        setProcessingVote(true);
        e.preventDefault();
        e.stopPropagation();
        if (!auth.isAuthenticated) {
          throw new Error(`You must be logged in to ${type} posts`);
        }
        if (processingVote) return null;

        const res = await dispatch(voteAction(amount, post, auth.user, vote));
        if (!res || res.undoInvest) return setProcessingVote(false);

        const startRank = post.data ? post.data.pagerank : 0;
        const total = startRank + res.rankChange + 1;
        const upvoteAmount = Math.round(total) - Math.round(startRank);

        investButton.current.measureInWindow((x, y, w, h) => {
          const parent = { x, y, w, h };
          if (x + y + w + h === 0) return;
          const action = triggerAnimation(type, {
            parent,
            amount: upvoteAmount,
            horizontal
          });
          dispatch(action);
        });

        Analytics && Analytics.logEvent(type);
        ReactGA &&
          ReactGA.event({
            category: 'User',
            action: `${type}ed a post`
          });
        return setProcessingVote(false);
      } catch (err) {
        setProcessingVote(false);
        return browserAlerts.alert(err.message);
      }
    },
    [dispatch, post, auth, vote, processingVote, setProcessingVote]
  );

  if (!post || post === 'notFound') return null;

  const ownPost = auth.user && auth.user._id === post.user;
  const vote = ownPost ? true : post.myVote;
  const votedUp = vote && vote.amount > 0;
  const votedDown = vote && vote.amount < 0;

  const postRank = post.data
    ? Math.round(post.data.pagerank) + post.data.upVotes - post.data.downVotes
    : 0;

  const now = new Date();
  const bettingEnabled = community && community.betEnabled;
  const canBet =
    bettingEnabled &&
    post.data.eligibleForReward &&
    now.getTime() < new Date(post.data.payoutTime).getTime();

  const postType = getPostType({ post });
  const tipText =
    postType === 'link'
      ? 'Upvote articles that are worth reading, downvote spam.'
      : `Upvote quality ${postType}s and downvote spam`;

  const tooltipData = {
    text: tipText,
    position: 'right',
    desktopOnly: true
  };

  return (
    <View
      ref={investButton}
      onLayout={() => {}}
      align="center"
      fdirection={horizontal ? 'row' : 'column'}
      style={{ opacity: 1 }} // need this to make animations work on android
    >
      <PostButton
        tooltipData={tooltipData}
        key={`${post.id}-up`}
        imageSet="UPVOTE"
        isActive={votedUp}
        alt="upvote"
        color={color}
        onPress={e => castVote(e, vote, 1)}
      />
      {canBet ? (
        <CenterButton horizontal={horizontal} votedUp={votedUp} post={post} />
      ) : (
        <RankEl horizontal={horizontal} postRank={postRank} color={color} post={post} />
      )}
      <PostButton
        tooltipData={tooltipData}
        key={`${post.id}-down`}
        imageSet="DOWNVOTE"
        isActive={votedDown}
        alt="downvote"
        color={color}
        onPress={e => castVote(e, vote, -1)}
      />
    </View>
  );
}

RankEl.propTypes = {
  horizontal: PropTypes.bool,
  postRank: PropTypes.number,
  color: PropTypes.string,
  post: PropTypes.object
};

function RankEl({ horizontal, postRank, color, post }) {
  const type = getPostType({ post });
  const tipText =
    type === 'link'
      ? "This is the article's reputation score"
      : `This is the ${type}'s reputation scroe`;
  const tooltipData = { text: tipText, position: 'right' };

  return (
    <View
      h={horizontal ? 2 : 4}
      minwidth={horizontal ? 8 : null}
      justify={'center'}
      align={'center'}
    >
      <Tooltip name="vote" data={tooltipData} />
      <NumericalValue
        c={color || colors.secondaryText}
        fs={2}
        lh={2}
        m={horizontal ? '0 1' : null}
      >
        {postRank || 0}
      </NumericalValue>
    </View>
  );
}
