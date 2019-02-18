import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image, Touchable } from 'modules/styled/uni';

const BUTTON_IMAGES = {
  UPVOTE: {
    white: require('app/public/img/uparrow-white.png'),
    default: require('app/public/img/uparrow-grey-outline.png'),
    active: require('app/public/img/uparrow-blue.png'),
    hover: require('app/public/img/uparrow-blue-outline.png')
  },
  DOWNVOTE: {
    white: require('app/public/img/downarrow-white.png'),
    default: require('app/public/img/downarrow-grey-outline.png'),
    active: require('app/public/img/downarrow-red.png'),
    hover: require('app/public/img/downarrow-blue-outline.png')
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
    const { alt, isActive, imageSet, onPress, color } = this.props;
    const images = BUTTON_IMAGES[imageSet];
    let source = isActive ? images.active : images[color] || images.default;
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
          source={source}
          onMouseEnter={this.handleOnMouseOver}
          onMouseLeave={this.handleOnMouseOut}
        />
      </Touchable>
    );
  }
}

PostButton.propTypes = {
  color: PropTypes.string,
  alt: PropTypes.string,
  isActive: PropTypes.bool,
  imageSet: PropTypes.oneOf(['DOWNVOTE', 'UPVOTE']),
  onPress: PropTypes.func
};

export default PostButton;
