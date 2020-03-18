import React, { memo } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import ULink from 'modules/navigation/ULink.component';
import { Image, View } from 'modules/styled/uni';
import { AVATAR_SIZE } from 'styles/layout';
import { goToProfile } from 'modules/navigation/navigation.actions';

UAvatar.propTypes = {
  user: PropTypes.object,
  size: PropTypes.number,
  noLink: PropTypes.bool,
  m: PropTypes.string,
  goToProfile: PropTypes.func,
  style: PropTypes.oneOfType([PropTypes.string, PropTypes.array])
};

function UAvatar({ size, user, m, goToProfile: onPress, style, noLink }) {
  const dispatch = useDispatch();
  if (!user) return null;
  const profileLink = '/user/profile/' + user.handle;

  const image = user.image
    ? { uri: user.image }
    : require('app/public/img/default_user.jpg');
  const imageSize = size || AVATAR_SIZE;
  const AvatarImage = (
    <Image source={image} h={imageSize} w={imageSize} bradius={imageSize / 2} />
  );
  if (noLink) {
    return (
      <View style={style} m={m}>
        {AvatarImage}
      </View>
    );
  }
  return (
    <View style={style} m={m}>
      <ULink
        onPress={() => (onPress ? onPress(user) : dispatch(goToProfile(user)))}
        onClick={e => e.stopPropagation()}
        to={profileLink}
      >
        {AvatarImage}
      </ULink>
    </View>
  );
}

export default memo(UAvatar);
