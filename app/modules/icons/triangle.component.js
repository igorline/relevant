import React from 'react';
import { colors } from 'app/styles';
import { Text } from 'modules/styled/uni';

const Triangle = ({ direction }) => {
  if (direction === 'UP') {
    return <Text c={colors.green} display="inline">▲</Text>;
  }
  if (direction === 'DOWN') {
    return <Text c={colors.red} display="inline">▼</Text>;
  }
  return null;
};

export default Triangle;
