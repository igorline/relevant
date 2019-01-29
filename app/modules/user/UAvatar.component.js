import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ULink from 'modules/navigation/ULink.component';
import { Image, View } from 'modules/styled';
import { sizing } from 'app/styles';

class UAvatar extends Component {
  static propTypes = {
    user: PropTypes.object,
    size: PropTypes.number,
    noLink: PropTypes.bool,
    m: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
    ]),
  };

  render() {
    const { size, user, m } = this.props;
    if (!user) return null;
    const profileLink = '/user/profile/' + this.props.user.handle;

    const image = this.props.user.image || '/img/default_user.jpg';
    const imageSize = size || 4;
    const AvatarImage = (
      <Image
        source={{ uri: image }}
        h={sizing(imageSize)}
        w={sizing(imageSize)}
        br={sizing(imageSize / 2)}
      />);
    if (this.props.noLink) {
      return (
        <View style={this.props.style} className={this.props.className} m={m}>
          {AvatarImage}
        </View>
      );
    }
    return (
      <View style={this.props.style} className={this.props.className} m={m} >
        <ULink
          onClick={e => e.stopPropagation()}
          className={'avatar'}
          to={profileLink}
        >
          {AvatarImage}
        </ULink>
      </View>
    );
  }
}

export default UAvatar;
