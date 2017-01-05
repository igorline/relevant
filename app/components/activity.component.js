import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';

import { numbers } from '../utils';
import { globalStyles } from '../styles/global';

let moment = require('moment');
let styles;

export default function (props) {
  let singleActivity = props.singleActivity;
  if (!singleActivity) return null;

  let activityTime = moment(singleActivity.createdAt);
  let fromNow = numbers.timeSince(activityTime);
  let postTitle = 'Untitled';

  if (singleActivity.post) {
    if (singleActivity.post.title) {
      postTitle = singleActivity.post.title;
    } else if (singleActivity.post.body) {
      postTitle = singleActivity.post.body.substring(0, 20);
    }
  }
  singleActivity.post.title = postTitle;

  let setSelected = (user) => {
    props.navigator.goToProfile(user);
  };

  let goToPost = (post) => {
    props.navigator.goToPost(post);
  };

  let renderRight = () => {
    if (singleActivity.type) {
      let amountEl = null;
      return (<View style={styles.activityRight}>
        {amountEl}
        <Text style={[{ fontSize: 11, color: '#B0B3B6', flex: 0.4, textAlign: 'right' }]}>{fromNow}</Text>
      </View>);
    }
    return null;
  };

  let renderName = (user) => {
    return (<Text style={styles.link} onPress={() => setSelected(user)}>
      {user.name}
    </Text>);
  };

  let renderPost = (post) => {
    return (<Text
      onPress={() => goToPost(post)}
      style={[styles.link, { fontStyle: 'italic' }]}
    >
      &nbsp;{post.title}
    </Text>);
  };

  let renderImage = (user) => {
    let image = (
      <TouchableWithoutFeedback onPress={() => setSelected(singleActivity.byUser)}>
        <Image style={styles.activityImage} source={require('../assets/images/default_user.jpg')} />
      </TouchableWithoutFeedback>);
    if (user && user.image) {
      image = (<TouchableWithoutFeedback onPress={() => setSelected(singleActivity.byUser)}>
        <Image style={styles.activityImage} source={{ uri: singleActivity.byUser.image }} />
      </TouchableWithoutFeedback>);
    }
    return image;
  };

  let getText = () => {
    switch (singleActivity.type) {
      case 'investment':
        return (
          <Text>
            &nbsp;invested ${singleActivity.amount.toFixed(0)} in your post
          </Text>
        );

      case 'partialEarning':
        return (
          <Text>
            Earned ${singleActivity.amount.toFixed(0)} from {renderName(singleActivity.byUser)}'s investment in post
          </Text>
        );

      case 'comment':
        return (
          <Text>
            &nbsp;commented on your post
          </Text>
        );

      case 'postMention':
      case 'mention':
        return (
          <Text>
            &nbsp;mentioned you in the post
          </Text>
        );

      case 'commentMention':
        return (
          <Text>
            &nbsp;mentioned you in a comment in the post
          </Text>
        );

      default:
        return null;
    }
  };

  let renderLeft = () => {
    switch (singleActivity.type) {
      case 'partialEarning':
        return (
          <View style={styles.activityLeft}>
            {renderImage(singleActivity.byUser)}
            <Text numberOfLines={2} style={[{ flex: 1 }, styles.darkGray, styles.georgia]}>
              {getText(singleActivity)}
              {renderPost(singleActivity.post)}
            </Text>
          </View>
        );
      default:
        return (
          <View style={styles.activityLeft}>
            {renderImage(singleActivity.byUser)}
            <Text numberOfLines={2} style={[{ flex: 1 }, styles.darkGray, styles.georgia]}>
              {renderName(singleActivity.byUser)}
              {getText(singleActivity)}
              {renderPost(singleActivity.post)}
            </Text>
          </View>
        );
    }
  };

  return (
    <View style={[styles.singleActivity]}>
      {renderLeft()}
      {renderRight()}
    </View>
  );
}

const localStyles = StyleSheet.create({
  link: {
    color: '#4d4eff',
  },
  activityImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  activityImagePlaceholder: {
    height: 30,
    width: 30,
    marginRight: 10,
    backgroundColor: 'lightgrey',
    borderRadius: 15,
  }
});
styles = { ...localStyles, ...globalStyles };

