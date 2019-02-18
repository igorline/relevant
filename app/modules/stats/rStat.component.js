import React from 'react';
import PropTypes from 'prop-types';
import { abbreviateNumber } from 'app/utils/numbers';
import { userProps } from 'app/utils/propValidation';
import { sizing } from 'app/styles';
import { Image, ImageWrapper, NumericalValue } from 'modules/styled/uni';

const iconImage = require('app/public/img/r-emoji.png');

export default function RStat(props) {
  const { size, user, color, mr, align, ...rest } = props;
  if (!user) {
    return null;
  }
  const { relevance } = user;
  const pagerank = relevance ? relevance.pagerank || 0 : 0;

  const iconSize = size || 2.75;
  const imageMargin = align === 'center' ? 0 : sizing(-1, 'px');

  return (
    <ImageWrapper align={align || 'center'} mr={mr || 1.5} props={props} {...rest}>
      <Image
        h={iconSize}
        w={iconSize * 1.3}
        source={iconImage}
        mr={iconSize / 10}
        mb={-1 / 24}
        style={{ bottom: imageMargin }}
        resizeMode="contain"
      />
      <NumericalValue c={color}>{abbreviateNumber(pagerank) || 0}</NumericalValue>
    </ImageWrapper>
  );
}

RStat.propTypes = {
  align: PropTypes.string,
  mr: PropTypes.number,
  color: PropTypes.string,
  user: userProps,
  size: PropTypes.number
};
