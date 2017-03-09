import React, { Component } from 'react';
import {
  Image,
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet
} from 'react-native';
import { globalStyles } from '../styles/global';
import Stats from './post/stats.component';

let styles;

export default function (props) {

  if (!props.user) return null;

  let imageSource;
  if (props.user && props.user.image) {
    imageSource = { uri: props.user.image };
  } else imageSource = require('../assets/images/default_user.jpg');

  let imageStyle = styles.userImage;
  if (props.big) imageStyle = styles.userImageBig;

  // console.log('props ', props);

  let stats;
  if (props.user && props.user.relevance && props.relevance !== false) {
    stats = <Stats size={'small'} entity={props.user} type={'value'} />;
  }

  return (
    <TouchableWithoutFeedback
      onPress={() => props.setSelected(props.user)}
    >
      <View style={styles.postInfo}>
        <Image source={imageSource} style={imageStyle} />
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View>
              <Text style={[styles.font17, styles.darkGray, styles.bebas]}>
                {props.user.name}&nbsp;
              </Text>
            </View>
            {stats}
          </View>
          <Text style={[styles.font10, styles.greyText]}>
            {'@' + props.user._id} {props.postTime}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const localStyles = StyleSheet.create({
  userImageBig: {
    height: 44,
    width: 44,
    borderRadius: 22,
    marginRight: 7,
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
