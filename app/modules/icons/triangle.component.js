import React from 'react';
import PropTypes from 'prop-types';
import { colors } from 'app/styles';
import { Text } from 'modules/styled/uni';

const Triangle = ({ direction }) => {
  if (direction === 'UP') {
    return (
      <Text c={colors.green} display="inline">
        ▲
      </Text>
    );
  }
  if (direction === 'DOWN') {
    return (
      <Text c={colors.red} display="inline">
        ▼
      </Text>
    );
  }
  return null;
};

Triangle.propTypes = {
  direction: PropTypes.oneOf(['UP', 'DOWN'])
};

export default Triangle;
