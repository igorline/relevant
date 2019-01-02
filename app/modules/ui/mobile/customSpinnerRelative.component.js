import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles } from 'app/styles/global';

let styles;

export default function Spinner(props) {
  return (
    <View
      pointerEvents={'none'}
      style={props.visible ? styles.spinnerContainerRelative : styles.hideSpinner}
    >
      <ActivityIndicator animating={props.visible} size="large" />
    </View>
  );
}

Spinner.propTypes = {
  visible: PropTypes.bool
};

const localStyles = StyleSheet.create({
  spinnerContainerRelative: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  hideSpinner: {
    position: 'absolute'
  }
});

styles = { ...localStyles, ...globalStyles };
