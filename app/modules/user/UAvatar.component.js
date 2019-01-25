import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ULink from 'modules/navigation/ULink.component';
import styled from 'styled-components/primitives';
import sizing from 'app/styles/sizing';

const Wrapper = styled.View`
`;

const StyledImage = styled.Image`
  width: ${p => p.size ? sizing.byUnit(p.size) : sizing.byUnit(4)};
  height: ${p => p.size ? sizing.byUnit(p.size) : sizing.byUnit(4)};
  border-radius: 50;
`;

class UAvatar extends Component {
  static propTypes = {
    user: PropTypes.object,
    size: PropTypes.number,
    noLink: PropTypes.bool,
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
        </ULink>
      </Wrapper>
    );
  }
}

export default UAvatar;
