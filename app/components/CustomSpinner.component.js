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
    <View pointerEvents={'none'} style={styles.spinnerContainer}>
      <ActivityIndicator
        animating={props.visible}
        size="large"
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  spinnerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // width: fullWidth,
    // backgroundColor: 'rgba(0,255,0,0.12)',
    // height: fullHeight,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1
  }
});

styles = { ...localStyles, ...globalStyles };
