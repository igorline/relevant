import React from 'react';
import PropTypes from 'prop-types';
import { useLoginWithBox } from 'modules/auth/3box.hooks';
import { BoxButton } from './socialButtons';

BoxLogin.propTypes = {
  close: PropTypes.func,
  text: PropTypes.string
};

export default function BoxLogin({ close, text }) {
  const logIn = useLoginWithBox(close);
  return (
    <BoxButton
      mr={[4, 0]}
      mt={[0, 2]}
      flex={1}
      onPress={e => {
        e.preventDefault();
        logIn();
      }}
      text={text || 'Sign In with 3Box'}
    ></BoxButton>
  );
}
