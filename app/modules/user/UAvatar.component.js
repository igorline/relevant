import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ULink from 'modules/navigation/ULink.component';
import styled from 'styled-components/primitives';
import { Image } from 'modules/styled';
import { mixins, sizing } from 'app/styles';

const Wrapper = styled.View`
  ${mixins.margin}
`;

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
        br={50}
      />);
    if (this.props.noLink) {
      return (
        <Wrapper style={this.props.style} className={this.props.className} m={m}>
          {AvatarImage}
        </Wrapper>
      );
    }
    return (
      <Wrapper style={this.props.style} className={this.props.className} m={m} >
        <ULink
          onClick={e => e.stopPropagation()}
          className={'avatar'}
          to={profileLink}
        >
          {AvatarImage}
        </ULink>
      </Wrapper>
    );
  }
}

export default UAvatar;
