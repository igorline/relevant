import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { userProps } from 'app/utils/propValidation';
import { numbers } from 'app/utils';
import { colors } from 'app/styles';
import { NumericalValue, Text } from 'modules/styled/uni';

export default function Percent(props) {
  if (!get(props.user, 'relevance')) {
    return null;
  }
  const { align, mr, size, ...rest } = props;
  const percent = Math.max(0, numbers.percentChange(get(props.user, 'relevance')));
  const percentPretty = numbers.abbreviateNumber(percent);
  const isNegative = percent < 0;
  return (
    <NumericalValue {...rest} align={align || 'center'} mr={2 || mr}>
      <Text fs={size} c={isNegative ? colors.red : colors.green}>
        {isNegative ? '▼ ' : '▲ '}
      </Text>
      {percentPretty}%
    </NumericalValue>
  );
}

Percent.propTypes = {
  user: userProps,
  align: PropTypes.string,
  mr: PropTypes.string,
  size: PropTypes.number
};
