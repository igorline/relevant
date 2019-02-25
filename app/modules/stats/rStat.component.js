import React from 'react';
import PropTypes from 'prop-types';
import { abbreviateNumber } from 'app/utils/numbers';
import { userProps } from 'app/utils/propValidation';
import { sizing } from 'app/styles';
import { Image, ImageWrapper, NumericalValue, Text } from 'modules/styled/uni';

const iconImage = require('app/public/img/r-emoji.png');

export default function RStat(props) {
  const { size, user, color, mr, align, lh, inline, ...rest } = props;
  if (!user) {
    return null;
  }
  const { relevance } = user;
  const pagerank = relevance ? relevance.pagerank || 0 : 0;

  const iconSize = size || 3;
  const imageMargin = align === 'center' ? 0 : sizing(-1, 'px');

  if (inline) {
    return (
      <Text
        {...rest}
        inline={inline ? 1 : 0}
        align={align || 'center'}
        mr={typeof mr === 'number' ? mr : 1.5}
      >
        <Image
          h={iconSize * 0.85}
          w={iconSize * 1.2}
          source={iconImage}
          mr={iconSize / 10}
          style={{ bottom: imageMargin }}
          resizeMode={'contain'}
          inline={inline ? 1 : 0}
        />
        <NumericalValue inline={inline ? 1 : 0} lh={lh} c={color}>
          {abbreviateNumber(pagerank) || 0}
        </NumericalValue>
      </Text>
    );
  }

  return (
    <ImageWrapper
      {...rest}
      inline={inline ? 1 : 0}
      align={align || 'center'}
      mr={typeof mr === 'number' ? mr : 1.5}
    >
      <Image
        h={iconSize * 0.85}
        w={iconSize * 1.2}
        source={iconImage}
        mr={iconSize / 10}
        style={{ bottom: imageMargin }}
        resizeMode={'contain'}
        inline={inline ? 1 : 0}
      />
      <NumericalValue inline={inline ? 1 : 0} lh={lh} c={color}>
        {abbreviateNumber(pagerank) || 0}
      </NumericalValue>
    </ImageWrapper>
  );
}

RStat.propTypes = {
  inline: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  lh: PropTypes.number,
  align: PropTypes.string,
  mr: PropTypes.number,
  color: PropTypes.string,
  user: userProps,
  size: PropTypes.number
};
