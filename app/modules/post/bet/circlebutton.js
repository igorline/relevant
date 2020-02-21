import React from 'react';
import PropTypes from 'prop-types';
import { colors } from 'styles';
import { LinkFont, HoverButton } from 'modules/styled/uni';

CircleButton.propTypes = {
  children: PropTypes.node,
  onPress: PropTypes.func
};

export default function CircleButton({ children, onPress }) {
  return (
    <HoverButton
      border={1}
      w={8}
      h={8}
      minwidth={'auto'}
      bradius={4}
      bg={colors.white}
      onPress={onPress}
    >
      <LinkFont c={colors.blue} fs={2.5} lh={2.5}>
        {children}
      </LinkFont>
    </HoverButton>
  );
}
