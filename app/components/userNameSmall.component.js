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

  let imageStyle = styles.userImage;
  if (props.big) imageStyle = styles.userImageBig;

  return (
    <TouchableWithoutFeedback
      onPress={() => props.setSelected(props.user)}
    >
      <View style={styles.postInfo}>
        <Image source={imageSource} style={imageStyle} />
        <View>
          <Text style={[styles.font17, styles.darkGray, styles.bebas]}>
            {props.user.name}
          </Text>
          <Text style={[styles.font10, styles.greyText]}>
            {'@' + props.user._id}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const localStyles = StyleSheet.create({
  userImageBig: {
    height: 42,
    width: 42,
    borderRadius: 21,
    marginRight: 7,
  },
  userImage: {
    height: 28,
    width: 28,
    borderRadius: 14,
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
