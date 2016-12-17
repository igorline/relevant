import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { globalStyles, fullWidth, fullHeight } from '../styles/global';

let moment = require('moment');

class SingleActivity extends Component {

  setSelected(user) {
    this.props.navigator.goToProfile(user);
  }

  goToPost(post) {
    this.props.navigator.goToPost(post);
  }

  render() {
    let singleActivity = this.props.singleActivity;
    let activityEl = null;
    let styles = this.props.styles;
    let activityTime = moment(singleActivity.createdAt);
    let fromNow = activityTime.fromNow();

    if (singleActivity.personal && singleActivity.byUser) {
      let postTitle = singleActivity.post ? singleActivity.post.title : 'missing title';

      if (singleActivity.type === 'investment') {
        activityEl = (
          <View style={styles.singleActivity}>
            <View style={styles.activityLeft}>
              <Text style={styles.darkGray}>
                <Text style={styles.active} onPress={() => this.setSelected(singleActivity.byUser)}>
                  {singleActivity.byUser.name}
                </Text>
                &nbsp;invested {'$'+singleActivity.amount} in your post
                <Text numberOfLines={1} onPress={() => this.goToPost(singleActivity.post)} style={styles.active}>
                  {' ' + postTitle}
                </Text>
              </Text>
            </View>
            <View style={styles.activityRight}>
              <Text style={[styles.gray, styles.textRight]}>{fromNow}</Text>
            </View>
          </View>
        );
      }

      if (singleActivity.type === 'profile') {
        activityEl = (
          <View style={styles.singleActivity}>
            <Text style={styles.darkGray}>
              <Text style={styles.active} onPress={() => this.setSelected(singleActivity.byUser)}>
                {singleActivity.byUser.name}
              </Text>
              &nbsp;visited your profile
            </Text>
            <Text style={styles.gray}>{fromNow}</Text>
          </View>
        );
      }

      if (singleActivity.type === 'comment') {
        activityEl = (
          <View style={styles.singleActivity}>
            <View style={styles.activityLeft}>
              <Text style={styles.darkGray}>
                <Text style={styles.active} onPress={() => this.setSelected(singleActivity.byUser)}>
                  {singleActivity.byUser.name}
                </Text>
                &nbsp;commented on your post
              </Text>
              <Text
                onPress={() => this.goToPost(singleActivity.post)}
                numberOfLines={1}
                style={[styles.active]}
              >
                {singleActivity.post.title}
              </Text>
            </View>
            <View style={styles.activityRight}>
              <Text style={[styles.gray, styles.textRight]}>{fromNow}</Text>
            </View>
          </View>
        );
      }

      if (singleActivity.type === 'thirst') {
        activityEl = (
          <View style={styles.singleActivity}>
            <View style={styles.activityLeft}>
              <Text style={styles.darkGray}>
                <Text
                  style={styles.active}
                  onPress={() => this.setSelected(singleActivity.byUser)}
                >
                  {singleActivity.byUser.name}
                </Text>
              &nbsp;is thirsty 4 u 👅💦</Text>
            </View>
            <View style={styles.activityRight}>
              <Text style={[styles.gray, styles.textRight]}>
                {fromNow}
              </Text>
            </View>
          </View>
        );
      }

      if (singleActivity.type === 'mention') {
        activityEl = (
          <View style={styles.singleActivity}>
            <View style={styles.activityLeft}>
              <Text style={styles.darkGray}>
                <Text
                  style={styles.active}
                  onPress={() => this.setSelected(singleActivity.byUser)}
                >
                  @{singleActivity.byUser.name}
                </Text>
                &nbsp;mentioned you in a&nbsp;
                <Text
                  style={styles.active}
                  onPress={() => this.goToPost(singleActivity.post)}
                >
                  post
                </Text>
              </Text>
              <Text
                onPress={() => this.goToPost(singleActivity.post)}
                numberOfLines={1}
                style={[styles.active]}
              >
                {singleActivity.post.title}
              </Text>
            </View>
            <View style={styles.activityRight}>
              <Text style={[styles.gray, styles.textRight]}>{fromNow}</Text>
            </View>
          </View>
        );
      }
    }

    if (singleActivity.personal && !singleActivity.byUser) {
      let postTitle = singleActivity.post ? singleActivity.post.title : '';
      if (singleActivity.type === 'partialEarning') {
        activityEl = (
          <View style={[styles.singleActivity]}>
            <View style={styles.activityLeft}>
              <Text style={styles.darkGray}>
                Earned ${singleActivity.amount.toFixed(0)} from post
              </Text>
              <Text
                onPress={() => this.goToPost(singleActivity.post)}
                style={[styles.active]}
              >
                {postTitle}
              </Text>
            </View>
            <View style={styles.activityRight}>
              <Text style={[styles.gray, styles.textRight]}>{fromNow}</Text>
            </View>
          </View>
        );
      }

      if (!singleActivity.type) {
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
      if (singleActivity.byUser._id != this.props.auth.user._id) {
        if (singleActivity.type == 'online') {
          activityEl = (
            <View style={styles.singleActivity}>
              <View style={styles.activityLeft}>
                <Text style={styles.darkGray}>
                  <Text style={styles.active} onPress={() => this.setSelected(singleActivity.byUser)}>
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

  return activityEl;
  }
}

export default SingleActivity;

const localStyles = StyleSheet.create({
});

