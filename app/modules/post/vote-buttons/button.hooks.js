import { useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'app/utils/alert';
import { showModal } from 'modules/navigation/navigation.actions';
import { useAuth } from 'modules/auth/hooks';
import launchAnimation from './launchAnimation';
import { vote as voteAction, updatePostVote } from '../invest.actions';

const { alert } = Alert();

let Analytics;
let ReactGA;
if (process.env.WEB !== 'true') {
  Analytics = require('react-native-firebase').analytics();
} else {
  ReactGA = require('react-ga').default;
}

export function useCastVote({
  post,
  user,
  canBet
  // community
}) {
  const dispatch = useDispatch();
  const [processingVote, setProcessingVote] = useState(false);
  // const displayBetPrompt = showBetPrompt({ post, community, user });
  const displayBetPrompt = false;
  const hasAuth = useAuth();

  return useCallback(
    async (e, vote, amount) => {
      try {
        e.preventDefault();
        e.stopPropagation();
        if (processingVote) return;

        if (!hasAuth()) return;

        const type = amount > 0 ? 'upvote' : 'downvote';

        if (vote && vote.isManualBet && type === 'upvote' && canBet) {
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
        alert(err.message);
      }
    },
    [processingVote, hasAuth, dispatch, post, user, displayBetPrompt, canBet]
  );
}

export function useVoteAnimation({ post, investButton, horizontal }) {
  const dispatch = useDispatch();
  const newVote = useSelector(state => state.investments.voteSuccess);

  useEffect(() => {
    if (!newVote || !newVote._id) return;
    const postId = newVote.post._id || newVote.post;
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
    // clear new vote
    dispatch(updatePostVote());
  }, [newVote]); // eslint-disable-line
}

// function showBetPrompt({ post, community, user }) {
//   if (!post) return false;
//   const now = new Date();
//   const bettingEnabled = community && community.betEnabled;
//   const manualBet = user && user.notificationSettings.bet.manual;
//   return (
//     !manualBet &&
//     bettingEnabled &&
//     post.data &&
//     post.data.eligibleForReward &&
//     now.getTime() < new Date(post.data.payoutTime).getTime()
//   );
// }

function showBetModal({ dispatch, postId }) {
  setTimeout(() => dispatch(showModal('investModal', { postId })), 1000);
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
