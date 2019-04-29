import React from 'react';
import PropTypes from 'prop-types';
import RIcon from 'app/public/img/r.svg';
import { mixins, layout } from 'app/styles';
import styled from 'styled-components';
import UAvatar from 'modules/user/UAvatar.component';

const StyledRIcon = styled(RIcon)`
  * {
    fill: white;
  }
  ${mixins.padding}
  ${mixins.margin}
  ${mixins.image}
  ${mixins.width}
  ${mixins.height}
  ${mixins.background}
  ${mixins.borderRadius}
`;

const AvatarFieldPlaceholder = props => {
  const { user } = props;
  if (user && user.image) {
    return <UAvatar user={user} size={9} {...layout.formImageProps} />;
  }
  return <StyledRIcon {...layout.formImageProps} />;
};

AvatarFieldPlaceholder.propTypes = {
  user: PropTypes.object
};

export default AvatarFieldPlaceholder;
