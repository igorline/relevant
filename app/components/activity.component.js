import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';

import { globalStyles, fullWidth, fullHeight } from '../styles/global';

let moment = require('moment');

const localStyles = StyleSheet.create({
  activityImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  activityImageParent: {
  }
});
const styles = { ...localStyles, ...globalStyles };

export default function (props) {
  let singleActivity = props.singleActivity;
  if (!singleActivity) return null;

  let timeSince = (date) => {
    var seconds = Math.floor((new Date() - date) / 1000);
    var interval = Math.floor(seconds / 31536000);
    if (interval > 1) {
        return interval + 'y';
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + 'mo';
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + 'd';
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + 'hr';
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + 'm';
    }
    return Math.floor(seconds) + 's';
  };

  let activityTime = moment(singleActivity.createdAt);
  let fromNow = timeSince(activityTime);
  let postTitle = 'Untitled';

  if (singleActivity.post) {
    if (singleActivity.post.title) {
      postTitle = singleActivity.post.title;
    } else if (singleActivity.post.body) {
      postTitle = singleActivity.post.body.substring(0, 20);
    }
  }

  let setSelected = (user) => {
    props.navigator.goToProfile(user);
  };

  let goToPost = (post) => {
    props.navigator.goToPost(post);
  };

  let abbreviateNumber = (num) => {
    let fixed = 0;
    if (num === null) { return null; }
    if (num === 0) { return '0'; }
    if (typeof num !== 'number') num = Number(num);
    fixed = (!fixed || fixed < 0) ? 0 : fixed;
    let b = (num).toPrecision(2).split('e');
    let k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3);
    let c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3)).toFixed(1 + fixed);
    let d = c < 0 ? c : Math.abs(c);
    let e = d + ['', 'K', 'M', 'B', 'T'][k];
    return e;
  };

  let renderRight = () => {
    if (singleActivity.type) {
      let amountEl = null;
      if (singleActivity.post) {
        if (singleActivity.post.value) {
          amountEl = (<Text style={[styles.bebas, { textAlign: 'left', flex: 0.6 }]}>
            💵{abbreviateNumber(singleActivity.post.value)}
          </Text>);
        }
      }

      return (<View style={styles.activityRight}>
        {amountEl}
        <Text style={[{ fontSize: 11, color: '#B0B3B6', flex: 0.4, textAlign: 'right' }]}>{fromNow}</Text>
      </View>);
    }
    return null;
  };

  let renderLeft = () => {
    switch (singleActivity.type) {
      case 'investment':
        let investmentImage = null;
        if (singleActivity.byUser.image) {
          investmentImage = (<TouchableWithoutFeedback style={styles.activityImageParent} onPress={() => setSelected(singleActivity.byUser)}>
            <Image style={styles.activityImage} source={{ uri: singleActivity.byUser.image  }} />
          </TouchableWithoutFeedback>);
        }
        return (
          <View style={styles.activityLeft}>
            {investmentImage}
            <Text numberOfLines={2} style={[{ flex: 1 }, styles.darkGray, styles.georgia]}>
              <Text onPress={() => setSelected(singleActivity.byUser)}>
                {singleActivity.byUser.name}
              </Text>
              <Text>
                &nbsp;invested {'$' + singleActivity.amount} in your post
              </Text>
              <Text
                onPress={() => goToPost(singleActivity.post)}
                style={{ fontStyle: 'italic' }}
              >
                &nbsp;{postTitle}
              </Text>
            </Text>
          </View>
        );

      case 'partialEarning':
        let earningImage = null;
        if (singleActivity.post.image) {
          earningImage = (<TouchableWithoutFeedback style={styles.activityImageParent} onPress={() => goToPost(singleActivity.post)}>
            <Image style={styles.activityImage} source={{ uri: singleActivity.post.image }} />
          </TouchableWithoutFeedback>);
        }
        return (
          <View style={styles.activityLeft}>
            {earningImage}
            <Text numberOfLines={2} style={[{ flex: 1 }, styles.darkGray, styles.georgia]}>
              <Text>
                Earned ${singleActivity.amount.toFixed(0)} from post
              </Text>
              <Text
                onPress={() => goToPost(singleActivity.post)}
                style={{ fontStyle: 'italic' }}
              >
                &nbsp;{postTitle}
              </Text>
            </Text>
          </View>
        );

      case 'comment':
        return (
          <View style={styles.activityLeft}>
            <TouchableWithoutFeedback style={styles.activityImageParent} onPress={() => setSelected(singleActivity.byUser)}>
              <Image style={styles.activityImage} source={{ uri: singleActivity.byUser.image }} />
            </TouchableWithoutFeedback>
            <Text numberOfLines={2} style={[styles.georgia, { flex: 1 }]}>
              <Text style={[styles.darkGray]}>
                <Text style={{}} onPress={() => setSelected(singleActivity.byUser)}>
                  {singleActivity.byUser.name}
                </Text>
                &nbsp;commented on your post
              </Text>
              <Text
                onPress={() => goToPost(singleActivity.post)}
                style={{ fontStyle: 'italic' }}
              >
                &nbsp;{singleActivity.post.title}
              </Text>
            </Text>
          </View>
        );

      case 'mention':
        return (
          <View style={styles.activityLeft}>
            <TouchableWithoutFeedback style={styles.activityImageParent} onPress={() => setSelected(singleActivity.byUser)}>
              <Image style={styles.activityImage} source={{ uri: singleActivity.byUser.image }} />
            </TouchableWithoutFeedback>
            <Text numberOfLines={2} style={[styles.darkGray, styles.georgia]}>
              <Text
                style={[styles.active, { flex: 1 }]}
                onPress={() => setSelected(singleActivity.byUser)}
              >
                {singleActivity.byUser.name}
              </Text>
              &nbsp;mentioned you in the post&nbsp;
              <Text
                onPress={() => goToPost(singleActivity.post)}
                style={[{ fontStyle: 'italic' }, styles.georgia]}
              >
                &nbsp;{postTitle}
              </Text>
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.singleActivity]}>
      {renderLeft()}
      {renderRight()}
    </View>
  );
}

