import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image, Touchable } from 'modules/styled/uni';

const BUTTON_IMAGES = {
  UPVOTE: {
    default: '/img/uparrow-grey-outline.png',
    active: '/img/uparrow-blue.png',
    hover: '/img/uparrow-blue-outline.png'
  },
  DOWNVOTE: {
    default: '/img/downarrow-grey-outline.png',
    active: '/img/downarrow-red.png',
    hover: '/img/downarrow-blue-outline.png'
  }
};

class PostButton extends Component {
  state = {
    isHovering: false
  };

  handleOnMouseOver = event => {
    event.preventDefault();
    this.setState({ isHovering: true });
  };

  handleOnMouseOut = event => {
    event.preventDefault();
    this.setState({ isHovering: false });
  };
  render() {
    const { alt, isActive, imageSet, onPress } = this.props;
    const images = BUTTON_IMAGES[imageSet];
    let source = isActive ? images.active : images.default;
    if (this.state.isHovering) {
      source = images.hover;
    }
    return (
      <Touchable to="#" onPress={e => onPress(e)}>
        <Image
          w={3}
          h={2.8}
          alt={alt}
          resizeMode="contain"
          source={{ uri: source }}
          onMouseEnter={this.handleOnMouseOver}
          onMouseLeave={this.handleOnMouseOut}
          cursor="pointer"
        />
      </Touchable>
    );
  }
}

PostButton.propTypes = {
  alt: PropTypes.string,
  isActive: PropTypes.bool,
  imageSet: PropTypes.oneOf(['DOWNVOTE', 'UPVOTE']),
  onPress: PropTypes.func
};

export default PostButton;
