import React, { Component } from 'react';
import {
  Image,
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet
} from 'react-native';
import { globalStyles } from '../styles/global';

let styles;

export default function (props) {

  return (
    <TouchableWithoutFeedback
      onPress={() => props.setSelected(props.user)}
    >
      <View style={styles.postInfo}>
        {props.user.image ? <Image source={{ uri: props.user.image }} style={styles.userImage} /> : null}
        <Text style={[styles.font15, styles.darkGray, styles.bebas]}>
          {props.user.name}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
}

const localStyles = StyleSheet.create({
  userImage: {
    height: 25,
    width: 25,
    borderRadius: 12.5,
    marginRight: 5,
  },
  postInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});

styles = { ...globalStyles, ...localStyles };
