import React from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';

import { globalStyles, fullWidth, fullHeight } from '../styles/global';

let styles;

export default function (props) {
  return (
    <View pointerEvents={'none'} style={props.visible ? styles.spinnerContainerRelative : styles.hideSpinner}>
      <ActivityIndicator
        animating={props.visible}
        size="large"
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  spinnerContainerRelative: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hideSpinner: {
    position: 'absolute'
  }
});

styles = { ...localStyles, ...globalStyles };
