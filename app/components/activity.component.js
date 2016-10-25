import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
var moment = require('moment');

class SingleActivity extends Component {
  constructor(props, context) {
    super(props, context);
  }

  goToPost(post) {
    this.props.actions.setSelectedPost(post._id);
    this.props.navigator.push({
      key: 'singlePost',
      title: post.title,
      back: true,
      id: post._id
    });
  }

  setSelected(user) {
    this.props.actions.setSelectedUser(user._id);
    this.props.navigator.push({
      key: 'profile',
      title: user.name,
      back: true,
      id: user._id
    });
  }

  render() {
    var self = this;
    var singleActivity = self.props.singleActivity;
    var activityEl = null;
    var styles = self.props.styles;

    if (singleActivity.personal && singleActivity.byUser) {
      var activityTime = moment(singleActivity.createdAt);
      var fromNow = activityTime.fromNow();
      var postTitle = singleActivity.post ? singleActivity.post.title : 'missing title';
      if (singleActivity.type == 'investment') {
         activityEl = (
          <View style={styles.singleActivity}>
            <View style={styles.activityLeft}>
              <Text style={styles.darkGray}>
                <Text style={styles.active} onPress={() => self.setSelected(singleActivity.byUser)}>
                  {singleActivity.byUser.name}
                </Text>
                &nbsp;invested {'$'+singleActivity.amount} in your post
                <Text numberOfLines={1} onPress={() => self.goToPost(singleActivity.post)} style={styles.active}>
                {' ' + postTitle}
                </Text>
              </Text>
            </View>
            <View style={styles.activityRight}>
              <Text style={[styles.gray, styles.textRight]}>{fromNow}</Text>
            </View>
          </View>
        );
       } else if (singleActivity.type == 'profile') {
        activityEl = (
          <View style={styles.singleActivity}>
            <Text style={styles.darkGray}>
              <Text style={styles.active} onPress={() => self.setSelected(singleActivity.byUser)}>
                {singleActivity.byUser.name}
              </Text>
              &nbsp;visited your profile
            </Text>
            <Text style={styles.gray}>{fromNow}</Text>
          </View>
        );
       } else if (singleActivity.type == 'comment') {
        activityEl = (
          <View style={styles.singleActivity}>
            <View style={styles.activityLeft}>
              <Text style={styles.darkGray}>
                <Text style={styles.active} onPress={() => self.setSelected(singleActivity.byUser)}>
                  {singleActivity.byUser.name}
                </Text>
                &nbsp;commented on your post
              </Text>
              <Text onPress={() => self.goToPost(singleActivity.post)} numberOfLines={1} style={[styles.active]}>{singleActivity.post.title}</Text>
            </View>
            <View style={styles.activityRight}>
              <Text style={[styles.gray, styles.textRight]}>{fromNow}</Text>
            </View>
          </View>
        );
      } else if (singleActivity.type == 'thirst') {
        activityEl = (
          <View style={styles.singleActivity}>
            <View style={styles.activityLeft}>
              <Text style={styles.darkGray}>
                <Text style={styles.active} onPress={() => self.setSelected(singleActivity.byUser)}>{singleActivity.byUser.name}</Text>
              &nbsp;is thirsty 4 u 👅💦</Text>
            </View>
            <View style={styles.activityRight}>
            <Text style={[styles.gray, styles.textRight]}>{fromNow}</Text>
            </View>
          </View>
        );
       } else if (singleActivity.type == 'mention') {
        activityEl = (
          <View style={styles.singleActivity}>
            <View style={styles.activityLeft}>
              <Text style={styles.darkGray}>
                <Text style={styles.active} onPress={() => self.setSelected(singleActivity.byUser)}>{singleActivity.byUser.name}</Text>
                &nbsp;mentioned you in a post
              </Text>
              <Text onPress={() => self.goToPost(singleActivity.post)} numberOfLines={1} style={[styles.active]}>{singleActivity.post.title}</Text>
            </View>
            <View style={styles.activityRight}>
            <Text style={[styles.gray, styles.textRight]}>{fromNow}</Text>
            </View>
          </View>
        );
       }
    } else if (singleActivity.personal && !singleActivity.byUser) {
      var postTitle = singleActivity.post ? singleActivity.post.title : '';
      if (singleActivity.type == 'partialEarning') {
          activityEl = (
            <View style={styles.singleActivity}>
              <View style={styles.activityLeft}>
                <Text style={styles.darkGray}>
                  Earned ${singleActivity.amount.toFixed(0)} from post
                </Text>
                <Text onPress={() => self.goToPost(singleActivity.post)} style={[styles.active]}>{postTitle}
                </Text>
              </View>
              <View style={styles.activityRight}>
                <Text style={[styles.gray, styles.textRight]}>{fromNow}</Text>
              </View>
            </View>
          );
       } else {
          activityEl = (
            <View style={styles.singleActivity}>
              <Text style={styles.darkGray}>
                Generic notification
              </Text>
              <Text style={styles.gray}>{fromNow}</Text>
            </View>
          );
       }
    }

  if (!singleActivity.personal) {
    if (singleActivity.byUser) {
      if (singleActivity.byUser._id != self.props.auth.user._id) {
        var activityTime = moment(singleActivity.createdAt);
        var fromNow = activityTime.fromNow();
        if (singleActivity.type == 'online') {
          activityEl = (
            <View style={styles.singleActivity}>
              <View style={styles.activityLeft}>
                <Text style={styles.darkGray}>
                  <Text style={styles.active} onPress={() => self.setSelected(singleActivity.byUser)}>
                    {singleActivity.byUser.name}
                  </Text>
                  &nbsp;went online
                </Text>
              </View>
              <View style={styles.activityRight}>
                <Text style={[styles.gray, styles.textRight]}>{fromNow}</Text>
              </View>
            </View>
          );
        }
      }
    }
  }

  return (
    <View>
      {activityEl}
    </View>
  );
  }
}

export default SingleActivity;

const localStyles = StyleSheet.create({
});

