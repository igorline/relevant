import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLoginWithBox } from 'modules/auth/3box.hooks';
import { useWeb3, useMetamask } from 'modules/contract/contract.hooks';
import { utils } from 'ethers';
import { BoxButton } from './socialButtons';

BoxLogin.propTypes = {
  close: PropTypes.func,
  text: PropTypes.string
};

export default function BoxLogin({ close, text }) {
  const [doLogin, logIn] = useState(false);
  return (
    <Fragment>
      {doLogin && <Web3Login close={close} resetLogin={() => logIn(false)} />}
      <BoxButton
        mr={[4, 0]}
        mt={[0, 2]}
        flex={1}
        onPress={e => {
          e.preventDefault();
          logIn(false);
          setTimeout(() => logIn(true));
        }}
        text={text || 'Sign In with 3Box'}
      ></BoxButton>
    </Fragment>
  );
}

Web3Login.propTypes = {
  close: PropTypes.func
};

function Web3Login({ close }) {
  const [accounts] = useWeb3();
  const metamask = useMetamask();
  const address = accounts && accounts[0] && utils.getAddress(accounts[0]);
  const logIn = useLoginWithBox(close);

  useEffect(() => {
    metamask && address && logIn();
  }, [metamask, address]); // eslint-disable-line

  return null;
}
