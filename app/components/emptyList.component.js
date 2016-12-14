import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { globalStyles } from '../styles/global';

let styles;

export default function(props) {
  let type = props.type || '';
  let emoji = props.emoji || '😶';
  let visible = props.visible;

  return (
    <View style={[visible ? styles.emptyList : styles.hideEmptyList]} pointerEvents={visible ? 'auto' : 'none'}>
      <Text style={[styles.libre, { fontSize: 20 }]}>
        Sorry bruh, no {type} {emoji}
      </Text>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

styles = { ...localStyles, ...globalStyles };

