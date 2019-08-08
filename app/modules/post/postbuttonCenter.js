import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { View, LinkFont, HoverButton, Text } from 'modules/styled/uni';
import { timeLeft } from 'utils/numbers';
import { colors, sizing } from 'styles';
import { PAYOUT_TIME } from 'server/config/globalConstants';
import { showModal } from 'modules/navigation/navigation.actions';
import { PieChart } from 'modules/stats/piechart';
import ReactTooltip from 'react-tooltip';
import { setupMobileTooltips } from 'modules/tooltip/mobile/setupTooltips';

CenterButton.propTypes = {
  post: PropTypes.object,
  votedUp: PropTypes.bool,
  horizontal: PropTypes.bool
};

export function CenterButton({ post, votedUp, horizontal }) {
  const { payoutTime } = post.data;

  const size = horizontal ? 4 : 5;

  const dispatch = useDispatch();
  const openBetModal = () => dispatch(showModal('investModal', post));

  const timer = (
    <View w={size} h={size}>
      <Timer payoutTime={payoutTime} size={size} />
    </View>
  );

  return (
    <View p={horizontal ? '0 1.5' : '.75 0'}>
      {votedUp ? (
        <BetButton size={size} openBetModal={openBetModal} post={post} />
      ) : (
        timer
      )}
    </View>
  );
}

BetButton.propTypes = {
  size: PropTypes.number,
  openBetModal: PropTypes.func,
  post: PropTypes.object
};

export function BetButton({ size, openBetModal, post }) {
  const earning = useSelector(state =>
    state.earnings.pending
    .map(e => state.earnings.entities[e])
    .find(ee => ee.post === post._id)
  );

  const body = 'BET';

  return (
    <HoverButton
      w={size}
      h={size}
      minwidth={'0'}
      bradius={size / 2}
      onPress={openBetModal}
      bg={earning ? colors.blue : colors.white}
      p={'0 0'}
      bc={colors.blue}
      border={!earning}
    >
      <LinkFont c={earning ? colors.white : colors.blue}>{body}</LinkFont>
    </HoverButton>
  );
}

Timer.propTypes = {
  payoutTime: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  size: PropTypes.number
};

export function Timer({ payoutTime, size }) {
  const betButton = useRef();
  const dispatch = useDispatch();

  const updateTimerParams = () => {
    const now = new Date();
    const payoutDate = new Date(payoutTime);
    const percent = 100 - (100 * (payoutDate.getTime() - now.getTime())) / PAYOUT_TIME;
    const text = timeLeft({ _date: payoutTime, index: 1 });
    return { percent, text };
  };

  const [timer, updateTimer] = useState(updateTimerParams);

  useEffect(() => {
    const id = setInterval(() => updateTimer(updateTimerParams), 10000);
    return () => clearInterval(id);
  }, [payoutTime]);

  const tooltipData = {
    text: 'Upvote this post to be able to bet on it'
  };

  const { toggleTooltip } = setupMobileTooltips({
    tooltips: [{ name: 'bet', el: betButton, data: tooltipData }],
    dispatch
  });

  useEffect(() => {
    if (ReactTooltip.rebuild) ReactTooltip.rebuild();
  }, []);

  return (
    <Text
      ref={betButton}
      data-place={'right'}
      data-for="mainTooltip"
      data-tip={JSON.stringify({
        type: 'TEXT',
        props: tooltipData
      })}
      onPress={() => toggleTooltip('bet')}
    >
      <PieChart
        w={sizing(size)}
        h={sizing(size)}
        color={colors.black}
        strokeWidth={1}
        {...timer}
      />
    </Text>
  );
}
