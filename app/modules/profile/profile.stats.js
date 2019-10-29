import React from 'react';
import PropTypes from 'prop-types';
import CoinStat from 'modules/stats/coinStat.component';
import RStat from 'modules/stats/rStat.component';
import Percent from 'modules/stats/percent.component';
import { Text } from 'modules/styled/uni';

ProfileStats.propTypes = {
  user: PropTypes.object,
  isOwner: PropTypes.bool
};

export default function ProfileStats({ user, isOwner }) {
  return (
    <Text>
      <RStat pr={1.5} inline={1} size={1.75} user={user} align="baseline" />
      {'  '}
      <Percent size={1.75} user={user} align="baseline" />
      {'   '}
      <CoinStat inline={1} size={1.75} user={user} isOwner={isOwner} align="baseline" />
    </Text>
  );
}
