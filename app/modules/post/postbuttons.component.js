import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { browserAlerts } from 'app/utils/alert';
import PostButton from 'modules/post/postbutton.component';
import { View, NumericalValue } from 'modules/styled/uni';
import ReactTooltip from 'react-tooltip';
import { colors } from 'app/styles';
import { triggerAnimation } from 'modules/animation/animation.actions';
import { setupMobileTooltips } from 'modules/tooltip/mobile/setupTooltips';
import { useCommunity } from 'modules/community/community.selectors';
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
    myVote: PropTypes.object
  }),
  color: PropTypes.string,
  horizontal: PropTypes.bool,
  tooltip: PropTypes.bool
};

export default function PostButtons({ post, auth, color, horizontal, tooltip }) {
  const dispatch = useDispatch();
  const investButton = useRef();
  const [processingVote, setProcessingVote] = useState(false);
  const community = useCommunity();

  const { initTooltips, toggleTooltip } = setupMobileTooltips({
    tooltips: [{ name: 'vote', el: investButton }],
    dispatch
  });

  useEffect(() => {
    if (ReactTooltip.rebuild) ReactTooltip.rebuild();
    if (tooltip) initTooltips();
  }, []);

  const castVote = useCallback(
    async (e, vote, amount) => {
      try {
        const type = amount > 0 ? 'upvote' : 'downvote';
        setProcessingVote(true);
        e.preventDefault();
        e.stopPropagation();
        if (!auth.isAuthenticated) {
          setProcessingVote(false);
          throw new Error('You must be logged in to  posts');
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
          const action = triggerAnimation(type, { parent, amount: upvoteAmount });
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
    [dispatch, post, auth, vote, processingVote]
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

  return (
    <View
      ref={investButton}
      onLayout={() => {}}
      align="center"
      fdirection={horizontal ? 'row' : 'column'}
      style={{ opacity: 1 }} // need this to make animations work on android
    >
      <PostButton
        key={`${post.id}-up`}
        imageSet="UPVOTE"
        isActive={votedUp}
        alt="Upvote"
        color={color}
        onPress={e => castVote(e, vote, 1)}
      />
      {canBet ? (
        <CenterButton horizontal={horizontal} votedUp={votedUp} post={post} />
      ) : (
        <RankEl
          horizontal={horizontal}
          toggleTooltip={toggleTooltip}
          postRank={postRank}
          color={color}
          post={post}
        />
      )}
      <PostButton
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
  toggleTooltip: PropTypes.func,
  postRank: PropTypes.number,
  color: PropTypes.string,
  post: PropTypes.object
};

function RankEl({ horizontal, toggleTooltip, postRank, color, post }) {
  const isLink = !post.parentPost && post.url;
  const isComment = post.type === 'comment';

  const tipText = isLink
    ? 'Upvote articles that are worth reading, downvote spam.'
    : isComment
      ? 'Upvote quality comments and downvote spam'
      : 'Upvote quality posts and downvote spam';

  return (
    <View
      h={horizontal ? 2 : 4}
      minwidth={horizontal ? 7 : null}
      justify={'center'}
      align={'center'}
    >
      <NumericalValue
        onPress={() => toggleTooltip('vote')}
        c={color || colors.secondaryText}
        fs={2}
        lh={2}
        m={horizontal ? '0 1' : null}
        data-place={'right'}
        data-for="mainTooltip"
        data-tip={JSON.stringify({
          type: 'TEXT',
          props: {
            text: tipText
          }
        })}
      >
        {postRank || 0}
      </NumericalValue>
    </View>
  );
}
