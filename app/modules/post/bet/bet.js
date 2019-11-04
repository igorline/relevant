import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import {
  View,
  HoverButton,
  SecondaryText,
  SmallText,
  Header
  // Divider
} from 'modules/styled/uni';
import { timeLeftTick, abbreviateNumber as toFixed } from 'utils/numbers';
import { colors } from 'styles';
import { VOTE_COST_RATIO } from 'server/config/globalConstants';
import CoinStat from 'modules/stats/coinStat.component';
import { bet } from 'modules/post/invest.actions';
import { goToUrl } from 'modules/navigation/navigation.actions';
import Tooltip from 'modules/tooltip/tooltip.component';
import { exchangeLink, tokenEnabled } from 'modules/wallet/price.context';
import ULink from 'modules/navigation/ULink.component';
// import { NotificationToggle } from 'modules/profile/settings/settings.toggle';
import BetStats from './betstats';
import CircleButton from './circlebutton';
import SmallCoinStat from './smallcoinstat';

export function BetContainer({ ...props }) {
  const user = useSelector(state => state.auth.user) || {};
  const post = useSelector(state => state.posts.posts[state.navigation.modalData.postId]);
  if (!user || !post) return null;
  return <Bet user={user} post={post} {...props} />;
}

Bet.propTypes = {
  user: PropTypes.object,
  post: PropTypes.object,
  close: PropTypes.func
};

function Bet({ user, post, close }) {
  const dispatch = useDispatch();
  const earning = useSelector(state =>
    state.earnings.pending
      .map(e => state.earnings.entities[e])
      .find(ee => ee.post === post._id)
  );
  const [processingBet, setProcessingBet] = useState(false);

  const title = earning ? 'Increase Your Bet' : 'Bet on the Relevance of this Post';

  const totalBalance = user.balance + user.tokenBalance;
  const maxBet = totalBalance - user.lockedTokens;
  const defaultAmount = Math.max(maxBet * VOTE_COST_RATIO, 0);
  const [amount, setAmount] = useState(defaultAmount);

  // const time = getTimestamp(post.data.payoutTime).toLowerCase();
  const [time, setTimer] = useState(timeLeftTick(post.data.payoutTime));
  useEffect(() => {
    const id = setInterval(() => setTimer(timeLeftTick(post.data.payoutTime)), 1000);
    return () => clearInterval(id);
  }, [post.data.payoutTime, time]);

  if (!user || !post) return null;

  const plusAmount = () =>
    setAmount(a => {
      const largeStep = (maxBet - defaultAmount) / 5;
      const smallStep = defaultAmount / 5;
      const err = defaultAmount / 100;
      return a + smallStep <= defaultAmount + err
        ? a + smallStep
        : Math.min(a + largeStep, maxBet);
    });

  const minusAmount = () =>
    setAmount(a => {
      const largeStep = (totalBalance - user.lockedTokens - defaultAmount) / 5;
      const smallStep = defaultAmount / 5;
      const err = defaultAmount / 100;
      if (a - smallStep <= 0 + err) return a;
      return a - largeStep >= defaultAmount - err
        ? a - largeStep
        : Math.max(0, a - smallStep);
    });

  const placeBet = async () => {
    try {
      setProcessingBet(true);
      await dispatch(bet({ postId: post._id, stakedTokens: amount }));
      setProcessingBet(false);
      close();
    } catch (err) {
      setProcessingBet(false);
      // console.log(err);
    }
  };

  const exchageUrl = exchangeLink();

  const power = (100 * amount) / maxBet;

  const tooltipData = {
    text:
      'Posts that get upvoted by lots of users with high Reputation get payouts.\n\nBet more coins and bet early in order to win the biggest portion of the payout.'
  };

  // const renderNoCoin = () => (
  //   <Overlay flex={1} align={'center'} justify={'center'} bc={'hsla(0,0%, 100%, .9)'}>
  //     <BodyText>You don't have any Relevant Coins</BodyText>
  //     <BodyText mt={2}>
  //       You can get some{' '}
  //       <ULink to={exchangeLink()} external target="_blank">
  //         here
  //       </ULink>
  //     </BodyText>
  //   </Overlay>
  // );

  return (
    <View>
      <Header inline={1} mr={2}>
        {title} <Tooltip inline={1} name={'betInfo'} data={tooltipData} info />
      </Header>

      <View fdirection={'row'} align={'baseline'}>
        <SmallText mt={1} mr={1}>
          Time until payout: {time}
        </SmallText>
      </View>

      <View mt={4} fdirection="row" justify="space-between" align={'center'}>
        <CircleButton onPress={minusAmount}>–</CircleButton>
        <View pr={1}>
          <CoinStat
            align={'center'}
            fs={4.5}
            lh={4.5}
            spaceBetween={1}
            c={colors.black}
            amount={amount}
          />
        </View>
        <CircleButton onPress={plusAmount}>+</CircleButton>
      </View>
      <View mt={2}>
        <View h={0.5} fdirection={'row'}>
          <View w={`${power}%`} bg={colors.blue} />
          <View w={`${100 - power}%`} bg={colors.lightBorder} />
        </View>
        <View fdirection="row" justify="space-between">
          <SecondaryText mt={0.5}>
            Available Coins: <SmallCoinStat amount={maxBet - amount} />
          </SecondaryText>
          {tokenEnabled() && (
            <ULink to={exchageUrl} external target="_blank">
              <SecondaryText
                mt={0.5}
                c={colors.blue}
                onPress={() => {
                  dispatch(goToUrl(exchageUrl));
                }}
              >
                Get more coins
              </SecondaryText>
            </ULink>
          )}
        </View>
      </View>

      <View mt={3}>
        <BetStats maxBet={maxBet} post={post} amount={amount} earning={earning} />
      </View>

      <HoverButton mt={3} onPress={placeBet} disabled={processingBet}>
        Bet {toFixed(amount)} Coins
      </HoverButton>

      {/*      <Divider mt={2} />
       */}

      <SmallText mt={2}>
        *You always your coins back once the betting round ends.
      </SmallText>

      {/*      <NotificationToggle
        notification={user.notificationSettings.bet.manual}
        parent={'bet'}
        label={'manual'}
        togglePosition={'right'}
        DescriptionComponent={SmallText}
        text={{
          description: "Don't like betting? Disable manual bet mode."
        }}
      /> */}
    </View>
  );
}

export default BetContainer;
