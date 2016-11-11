import React from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';

let styles;

export default function (props) {
  return (
    <View pointerEvents={'none'} style={styles.container}>
      <ActivityIndicator
        animating={props.visible}
        size="large"
      />
    </View>
  );
}

styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1
  }
});
