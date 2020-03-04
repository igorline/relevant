import React from 'react';
import PropTypes from 'prop-types';
import { ButtonWithIcon, LinkFont, Image } from 'modules/styled/uni';
import ULink from 'modules/navigation/ULink.component';
import { colors } from 'app/styles';

const boxIcon = require('app/public/img/icons/3box.png');

const boxIconComponent = (
  <Image resizeMode={'contain'} source={boxIcon} w={3} h={3} mr={1.5} />
);

const MetamaskIcon = require('app/public/img/metamask.png');

const MetamaskIconComponent = (
  <Image resizeMode={'contain'} source={MetamaskIcon} w={3} h={3} mr={1.5} />
);

BoxButton.propTypes = {
  onPress: PropTypes.func,
  text: PropTypes.string
};

export function BoxButton({ text, onPress, ...styleProps }) {
  return (
    <ULink to={'#'} onClick={onPress}>
      <LinkFont c={colors.blue}>
        <ButtonWithIcon
          {...styleProps}
          fdirection={'row'}
          bg={'rgb(248,49,255)'}
          image={boxIconComponent}
          text={text}
        />
      </LinkFont>
    </ULink>
  );
}

MetamaskButton.propTypes = {
  onPress: PropTypes.func,
  text: PropTypes.string
};

export function MetamaskButton({ text, onPress, ...styleProps }) {
  return (
    <ULink to={'#'} onClick={onPress}>
      <LinkFont c={colors.blue}>
        <ButtonWithIcon
          {...styleProps}
          fdirection={'row'}
          bg={'#161616'}
          image={MetamaskIconComponent}
          text={text}
        />
      </LinkFont>
    </ULink>
  );
}
