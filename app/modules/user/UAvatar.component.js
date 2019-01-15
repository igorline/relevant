import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ULink from 'modules/navigation/ULink.component';
import styled from 'styled-components/primitives';

const StyledText = styled.Text`
`;

const Wrapper = styled.View`
`;

const StyledImage = styled.Image`
  width: ${props => props.size ? props.size : '30px'};
  height: ${props => props.size ? props.size : '30px'};
  border-radius: 50;
  display: inline-block;
  background: black;
`;


if (process.env.BROWSER === true) {
  require('./avatarbox.css');
}

class UAvatar extends Component {
  static propTypes = {
    user: PropTypes.object,
    size: PropTypes.number,
    noLink: PropTypes.bool,
    noName: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
    ]),
  };

  render() {
    if (!this.props.user) return null;
    const profileLink = '/user/profile/' + this.props.user.handle;

    const image = this.props.user.image || '/img/default_user.jpg';
    const AvatarImage = <StyledImage source={{ uri: image }} size={this.props.size} />;
    if (this.props.noLink) {
      return (
        <Wrapper style={this.props.style} className={this.props.className}>
          {AvatarImage}
          {this.props.noName ? null : <StyledText>{this.props.user.name}</StyledText>}
        </Wrapper>
      );
    }
    return (
      <Wrapper style={this.props.style} className={this.props.className}>
        <ULink
          onClick={e => e.stopPropagation()}
          className={'avatar'}
          to={profileLink}
        >
          {AvatarImage}
          {this.props.noName ? null : this.props.user.name}
        </ULink>
      </Wrapper>
    );
  }
}

export default UAvatar;
