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

  let imageSource;
  if (props.user.image) {
    imageSource = { uri: props.user.image };
  }
  else imageSource = require('../assets/images/default_user.jpg');

  return (
    <TouchableWithoutFeedback
      onPress={() => props.setSelected(props.user)}
    >
      <View style={styles.postInfo}>
        <Image source={imageSource} style={styles.userImage} />
        <Text style={[styles.font17, styles.darkGray, styles.bebas]}>
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
    backgroundColor: 'white'
  },
});

styles = { ...globalStyles, ...localStyles };
