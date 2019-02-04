import React from 'react';
import PropTypes from 'prop-types';
import { abbreviateNumber } from 'app/utils/numbers';
import { userProps } from 'app/utils/propValidation';
import { sizing } from 'app/styles';
import { Image, ImageWrapper, NumericalValue } from 'modules/styled/uni';

const iconImage = require('app/public/img/r-emoji.png');

export default function RStat(props) {
  const { size, user, color, mr, align } = props;
  const { relevance } = user;
  const pagerank = relevance ? relevance.pagerank || 0 : 0;

  const iconSize = size || 3;
  const imageMargin = align === 'center' ? 0 : sizing(-size / 10);

  return (
    <ImageWrapper align={align || 'center'} mr={sizing(mr || 1.5)} props={props}>
      <Image
        h={iconSize}
        w={iconSize}
        source={iconImage}
        mr={iconSize / 4}
        style={{ bottom: imageMargin }}
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
  size: PropTypes.number,
};
