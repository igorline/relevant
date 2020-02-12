import React from 'react';
import PropTypes from 'prop-types';
import { ButtonWithIcon, LinkFont, Image } from 'modules/styled/uni';
import ULink from 'modules/navigation/ULink.component';
import { useLoginWithBox } from 'modules/auth/3box.hooks';
import { colors } from 'app/styles';

const boxIcon = require('app/public/img/icons/3box.png');

const boxIconComponent = (
  <Image resizeMode={'contain'} source={boxIcon} w={3} h={3} mr={1.5} />
);

BoxLogin.propTypes = {
  close: PropTypes.func
};

export default function BoxLogin({ close }) {
  const logIn = useLoginWithBox(close);
  return (
    <ULink
      to={'#'}
      mr={[4, 0]}
      onClick={e => {
        e.preventDefault();
        logIn();
      }}
    >
      <LinkFont c={colors.blue}>
        <ButtonWithIcon
          bg={'rgb(248,49,255)'}
          image={boxIconComponent}
          text="Sign In with 3Box"
        />
      </LinkFont>
    </ULink>
  );
}
