import React from 'react';
import PropTypes from 'prop-types';
import { abbreviateNumber } from 'app/utils/numbers';
import { userProps } from 'app/utils/propValidation';
import { fonts, mixins, sizing } from 'app/styles';
import styled from 'styled-components/primitives';
import { Image, ImageWrapper } from 'modules/styled';

const NumericalValue = styled.Text`
  ${fonts.numericalValue}
  ${mixins.inheritfont}
`;

const iconImage = require('app/public/img/r-emoji.png');

export default function RStat(props) {
  const { size, user, color, mr } = props;
  const { relevance } = user;
  const pagerank = relevance ? relevance.pagerank || 0 : 0;

  const iconSize = size || 3;

  return (
    <ImageWrapper mr={sizing(mr || 1.5)} props={props}>
      <Image
        h={sizing(iconSize)}
        w={sizing(iconSize)}
        c={color}
        source={iconImage}
        mr={sizing(iconSize / 4)}
      />
      <NumericalValue>{abbreviateNumber(pagerank) || 0}</NumericalValue>
    </ImageWrapper>
  );
}

RStat.propTypes = {
  mr: PropTypes.number,
  color: PropTypes.string,
  user: userProps,
  size: PropTypes.number,
};
