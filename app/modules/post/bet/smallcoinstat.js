import React from 'react';
import PropTypes from 'prop-types';
import CoinStat from 'modules/stats/coinStat.component';
import { colors } from 'styles';

SmallCoinStat.propTypes = {
  amount: PropTypes.number
};

export default function SmallCoinStat({ amount, ...rest }) {
  return (
    <CoinStat
      size={1.5}
      fs={1.5}
      secondary
      c={colors.black}
      inline={1}
      amount={amount}
      {...rest}
    />
  );
}
