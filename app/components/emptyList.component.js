import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { globalStyles, fullHeight } from '../styles/global';

let styles;

export default function (props) {
  let type = props.type || '';
  let emoji = props.emoji || '😶';
  let visible = props.visible;

  return (
    <View style={[visible ? styles.emptyList : styles.hideEmptyList]} pointerEvents={visible ? 'auto' : 'none'}>
      <Text style={[styles.libre, { fontSize: 40, textAlign: 'center' }]}>
        Sorry, no {type} {emoji}
      </Text>
      {props.children}
    </View>
  );
}

const localStyles = StyleSheet.create({
  hideEmptyList: {
    flex: 0,
    opacity: 0,
    position: 'absolute',
  },
  emptyList: {
    flex: 1.8,
    height: fullHeight - 59 * 2,
    paddingLeft: 40,
    paddingRight: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

styles = { ...localStyles, ...globalStyles };

