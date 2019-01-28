import React from 'react';
import PropTypes from 'prop-types';
import { abbreviateNumber } from 'app/utils/numbers';
import { userProps } from 'app/utils/propValidation';
import { NumericalValue } from 'modules/styled';
import { Icon, IconWrapper } from './styled.components';

const iconImage = require('app/public/img/r-emoji.png');

export default function RStat(props) {
  const { size, user, color, mr } = props;
  const { relevance } = user;
  const pagerank = relevance ? relevance.pagerank || 0 : 0;

  return (
    <IconWrapper mr={mr} props={props}>
      <Icon
        size={size}
        color={color}
        source={iconImage}
      />
      <NumericalValue>{abbreviateNumber(pagerank) || 0}</NumericalValue>
    </IconWrapper>
  );
}

RStat.propTypes = {
  mr: PropTypes.number,
  color: PropTypes.string,
  user: userProps,
  size: PropTypes.number,
};
