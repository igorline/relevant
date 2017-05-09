import React from 'react';
import {
  Image,
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet
} from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles } from '../styles/global';
import Stats from './post/stats.component';

let styles;

export default function UserName(props) {
  let repostIcon;
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
    stats = <Stats entity={props.user} type={'relevance'} />;
  }
  let handle;
  if (props.user._id) handle = '@' + props.user._id;

  if (props.repost) {
    repostIcon = (
      <Image
        resizeMode={'contain'}
        source={require('../assets/images/reposted.png')}
        style={{ width: 16, height: 14, marginRight: 3, marginBottom: 12 }}
      />
    );
  }

  return (
    <TouchableWithoutFeedback
      onPress={() => props.setSelected(props.user)}
      // style={{ flex: 1 }}
    >
      <View style={styles.postInfo}>
        <Image source={imageSource} style={imageStyle} />
        {repostIcon}
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View>
              <Text style={[styles.font17, styles.darkGray, styles.bebas]}>
                {props.user.name}&nbsp;
              </Text>
            </View>
            {stats}
          </View>
          {handle ? (
            <Text style={[styles.font10, styles.greyText]}>
              {handle} {props.postTime}
            </Text>) : null }
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

UserName.propTypes = {
  user: PropTypes.object,
  big: PropTypes.bool,
  relevance: PropTypes.bool,
  repost: PropTypes.bool,
  postTime: PropTypes.string,
  setSelected: PropTypes.func,
};

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
