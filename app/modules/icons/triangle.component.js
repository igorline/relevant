import React from 'react';
import PropTypes from 'prop-types';
import { colors } from 'app/styles';
import { Text } from 'modules/styled/uni';

const Triangle = ({ direction, inline, lh }) => {
  if (direction === 'UP') {
    return (
      <Text lh={lh} inline={inline} c={colors.green}>
        ▲
      </Text>
    );
  }
  if (direction === 'DOWN') {
    return (
      <Text lh={lh} inline={inline} c={colors.red}>
        ▼
      </Text>
    );
  }
  return null;
};

Triangle.propTypes = {
  direction: PropTypes.oneOf(['UP', 'DOWN']),
  inline: PropTypes.number,
  lh: PropTypes.number
};

export default Triangle;
