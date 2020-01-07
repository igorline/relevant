import React, { Fragment, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { SmallText, Text, View } from 'modules/styled/uni';
import { computeShares } from 'app/utils/post';
import { computePostPayout } from 'app/utils/rewards';
import { useCommunity } from 'modules/community/community.selectors';
import { PieChart } from 'modules/stats/piechart';
import { getPostInvestments } from 'modules/post/invest.actions';
import { colors } from 'styles';
import { abbreviateNumber as toFixed } from 'utils/numbers';
import SmallCoinStat from './smallcoinstat';

BetStats.propTypes = {
  post: PropTypes.object,
  earning: PropTypes.object,
  amount: PropTypes.number,
  maxBet: PropTypes.number
};

export default function BetStats({ post, amount, earning, maxBet }) {
  const community = useCommunity();

  const investments = useSelector(state =>
    (state.investments.posts[post._id] || [])
      .map(_id => state.investments.investments[_id])
      .filter(inv => inv.stakedTokens > 0 && inv.investor !== state.auth.user._id)
  );

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getPostInvestments(post._id));
  }, [dispatch, post._id]);

  const existingShares = earning ? earning.shares : 0;
  const existingStake = earning ? earning.stakedTokens : 0;
  const bets = investments.length;
  const users = bets > 1 ? 'users' : 'user';
  const invText = bets
    ? `${bets} ${users} bet a total of ${toFixed(
        post.data.totalShares - existingStake
      )} coins on this post`
    : '';
  // : 'You are the first to bet on this post!';

  const shares = computeShares({ post, stakedTokens: amount });
  const postRewards = computePostPayout(post.data, community);
  const shareOfRewards = !bets
    ? (existingStake + amount) / (maxBet + existingStake)
    : (shares + existingShares) / (post.data.shares + shares);

  const shareOfRewardsPercent = shareOfRewards * 100;
  const potentialRewards = postRewards * shareOfRewards;
  // const showPie = shareOfRewards !== 1;

  const shareEl = (
    <SmallText inline={1}>
      {'  '}
      <Text style={{ top: 2 }} inline={1} mb={-0.5}>
        <PieChart
          w={'12px'}
          h={'12px'}
          percent={100 - shareOfRewardsPercent}
          strokeWidth={30}
          color={colors.blue}
        />
      </Text>{' '}
      {toFixed(shareOfRewardsPercent)}%
    </SmallText>
  );

  return (
    <Fragment>
      <SmallText>{invText}</SmallText>
      {potentialRewards > 0 && (
        <View mt={0.25} fdirection={'row'}>
          <SmallText inline={1}>
            Your estimated rewards: <SmallCoinStat amount={potentialRewards} />
          </SmallText>
          <SmallText inline={1}>{shareEl} of total</SmallText>
        </View>
      )}
    </Fragment>
  );
}
