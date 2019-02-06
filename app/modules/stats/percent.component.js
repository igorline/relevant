import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import { userProps } from 'app/utils/propValidation';
import { numbers } from 'app/utils';
import { colors, sizing } from 'app/styles';
import { NumericalValue, Text } from 'modules/styled/uni';

export default function Percent(props) {
  if (!get(props.user, 'relevance')) {
    return null;
  }
  const { align, mr, size } = props;
  const percent = numbers.percentChange(get(props.user, 'relevance'));
  const percentPretty = numbers.abbreviateNumber(percent);
  const imageMarginBottom = align === 'center' ? 0 : sizing(-size / 10);
  const isNegative = percent < 0;
  return (
    <NumericalValue align={align || 'center'} mr={2 || mr}>
      <Text
        fs={size}
        c={isNegative ? colors.red : colors.green}
        style={{ bottom: imageMarginBottom }}
      >
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
