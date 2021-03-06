import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Image, Touchable } from 'modules/styled/uni';
import styled from 'styled-components/primitives';
import { isNative } from 'styles';
import Tooltip from 'modules/tooltip/tooltip.component';
import { VOTE_BUTTON_SIZE } from 'styles/layout';

const BUTTON_IMAGES = {
  UPVOTE: {
    white: require('app/public/img/vote_buttons/upvote-white.png'),
    default: require('app/public/img/vote_buttons/upvote-grey-outline.png'),
    active: require('app/public/img/vote_buttons/upvote-blue.png'),
    hover: require('app/public/img/vote_buttons/upvote-blue-outline.png')
  },
  DOWNVOTE: {
    white: require('app/public/img/vote_buttons/downvote-white.png'),
    default: require('app/public/img/vote_buttons/downvote-grey-outline.png'),
    active: require('app/public/img/vote_buttons/downvote-red.png'),
    hover: require('app/public/img/vote_buttons/downvote-red-outline.png')
  }
};

const ButtonImage = styled(Image)`
  ${() =>
    !isNative
      ? `transition-property: all;
        transition-duration: 0.2s;
        transition-timing-function: ease`
      : ''}
  ${p =>
    p.hover && !p.active && !p.disabled && !isNative ? 'transform: scale(1.1);' : ''}
`;

PostButton.propTypes = {
  color: PropTypes.string,
  alt: PropTypes.string,
  isActive: PropTypes.bool,
  imageSet: PropTypes.oneOf(['DOWNVOTE', 'UPVOTE']),
  onPress: PropTypes.func,
  tooltipData: PropTypes.object
};

function PostButton({ alt, isActive, imageSet, onPress, color, tooltipData }) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  const images = BUTTON_IMAGES[imageSet];
  const defaultState = images[color] || images.default;
  const source = (isActive && images.active) || (hover && images.hover) || defaultState;

  return (
    <Tooltip data={tooltipData} name="voteDesk">
      <Touchable onPress={onPress} bradius={2}>
        <ButtonImage
          w={VOTE_BUTTON_SIZE}
          h={VOTE_BUTTON_SIZE}
          alt={alt}
          resizeMode="contain"
          source={source}
          hover={hover}
          active={active}
          onMouseDown={() => setActive(1)}
          onMouseUp={() => setActive(0)}
          onMouseEnter={() => setHover(1)}
          onMouseLeave={() => {
            setHover(0);
            setActive(0);
          }}
        />
      </Touchable>
    </Tooltip>
  );
}

export default PostButton;
