import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ULink from 'modules/navigation/link.component';
import styled from 'styled-components/primitives';

const StyledText = styled.Text`
`;

const StyledView = styled.View`
`;

const StyledImage = styled.Image`
  width: ${props => props.size ? props.size : '30px'};
  height: ${props => props.size ? props.size : '30px'};
  border-radius: 50;
  display: inline-block;
  background: green;
`;


if (process.env.BROWSER === true) {
  require('./avatarbox.css');
}

export default class UAvatar extends Component {
  static propTypes = {
    user: PropTypes.object,
    size: PropTypes.number,
    noLink: PropTypes.bool,
    noName: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.string,
  };

  render() {
    if (!this.props.user) return null;
    const profileLink = '/user/profile/' + this.props.user.handle;

    const image = this.props.user.image || '/img/default_user.jpg';
    const AvatarImage = <StyledImage source={{ uri: image }} size={this.props.size} />;
    if (this.props.noLink) {
      return (
        <StyledView style={this.props.style} className={this.props.className}>
          {AvatarImage}
          {this.props.noName ? null : <StyledText>{this.props.user.name}</StyledText>}
        </StyledView>
      );
    }
    return (
      <StyledView style={this.props.style} className={this.props.className}>
        <ULink
          onClick={e => e.stopPropagation()}
          className={'avatar'}
          to={profileLink}
        >
          {AvatarImage}
          {this.props.noName ? null : this.props.user.name}
        </ULink>
      </StyledView>
    );
  }
}
