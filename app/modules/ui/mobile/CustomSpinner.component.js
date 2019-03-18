import React from 'react';
import { ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import style from 'styled-components/primitives';

const SpinnerContainer = style.View`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
`;

export default function Spinner(props) {
  return (
    <SpinnerContainer pointerEvents={'none'}>
      <ActivityIndicator animating={props.visible} size={props.size || 'large'} />
    </SpinnerContainer>
  );
}

Spinner.propTypes = {
  visible: PropTypes.bool,
  size: PropTypes.string
};
