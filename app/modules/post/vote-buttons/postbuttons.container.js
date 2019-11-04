import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { browserAlerts } from 'app/utils/alert';
import { getPostType } from 'app/utils/post';
import { View, Image } from 'modules/styled/uni';
import { useCommunity } from 'modules/community/community.selectors';
import { sizing } from 'styles';
import { showModal } from 'modules/navigation/navigation.actions';
// import { CenterButton } from './center-button';
import PostButton from './postbutton';
import { vote as voteAction } from '../invest.actions';
import launchAnimation from './launchAnimation';
import PostRank from './postrank';

let Analytics;
let ReactGA;
if (process.env.WEB !== 'true') {
  Analytics = require('react-native-firebase').analytics();
} else {
  ReactGA = require('react-ga').default;
}

const coinImage = require('app/public/img/relevantcoin.png');

PostButtons.propTypes = {
  auth: PropTypes.object,
  post: PropTypes.shape({
    _id: PropTypes.string,
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
  const { user } = auth;
  const canBet = getCanBet({ post, community, user });
  const displayBetPrompt = showBetPrompt({ post, community, user });

  const newVote = useSelector(state => state.investments.voteSuccess);

  useEffect(() => {
    if (!newVote._id) return;
    const postId = (newVote && newVote.post) || newVote.post._id;
    if (postId !== post._id) return;

    const rankChange = computeRankChange({ post, rankChange: newVote.rankChange });
    const type = newVote.amount >= 0 ? 'upvote' : 'downvote';

    const el = investButton;
    const params = { amount: rankChange, horizontal };
    if (newVote.isManualBet && newVote.stakedTokens > 0) {
      params.amount = 0;
      launchAnimation({ type: 'bet', params, el, dispatch });
    } else {
      launchAnimation({ type, params, el, dispatch });
    }
  }, [newVote]); // eslint-disable-line

  const castVote = useCallback(
    async (e, vote, amount) => {
      try {
        e.preventDefault();
        e.stopPropagation();
        if (processingVote) return;

        const type = amount > 0 ? 'upvote' : 'downvote';
        if (!auth.isAuthenticated)
          throw new Error(`You must be logged in to ${type} posts`);

        if (vote && vote.isManualBet && type === 'upvote') {
          showBetModal({ dispatch, postId: post._id });
          return;
        }

        setProcessingVote(true);
        const res = await dispatch(
          voteAction({ amount, post, user, vote, displayBetPrompt })
        );
        setProcessingVote(false);
        if (!res || res.undoInvest) return;

        type === 'upvote' && canBet && showBetModal({ dispatch, postId: post._id });
        runAnalytics(type);
      } catch (err) {
        setProcessingVote(false);
        browserAlerts.alert(err.message);
      }
    },
    [processingVote, auth.isAuthenticated, dispatch, post, user, displayBetPrompt, canBet]
  );

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

function showBetModal({ dispatch, postId }) {
  setTimeout(() => dispatch(showModal('investModal', { postId })), 1000);
}

function showBetPrompt({ post, community, user }) {
  if (!post) return false;
  const now = new Date();
  const bettingEnabled = community && community.betEnabled;
  const manualBet = user && user.notificationSettings.bet.manual;
  return (
    !manualBet &&
    bettingEnabled &&
    post.data &&
    post.data.eligibleForReward &&
    now.getTime() < new Date(post.data.payoutTime).getTime()
  );
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

function computeRankChange({ post, rankChange }) {
  const startRank = post.data ? post.data.pagerank : 0;
  const total = startRank + rankChange + 1;
  return Math.round(total) - Math.round(startRank);
}

function runAnalytics(type) {
  Analytics && Analytics.logEvent(type);
  ReactGA &&
    ReactGA.event({
      category: 'User',
      action: `${type}ed a post`
    });
}
