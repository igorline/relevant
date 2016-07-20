'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableHighlight,
  LinkingIOS
} from 'react-native';
import { connect } from 'react-redux';
var Button = require('react-native-button');
import { bindActionCreators } from 'redux';
import * as authActions from '../actions/auth.actions';
import * as postActions from '../actions/post.actions';
import * as userActions from '../actions/user.actions';
require('../publicenv');
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
var moment = require('moment');

class SingleActivity extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
    }
  }

  goToPost(activity) {
    var self = this;
    self.props.actions.getActivePost(activity.post._id).then(function() {
      self.props.routes.SinglePost();
    })
  }

  setTagAndRoute(tag) {
    var self = this;
    self.props.actions.setTag(tag);
    self.props.routes.Discover();
  }

  setSelected(id) {
    var self = this;
    if (id == self.props.auth.user._id) {
      self.props.routes.Profile();
    } else {
      self.props.actions.getSelectedUser(id);
    }
  }

  render() {
    var self = this;
    var singleActivity = self.props.singleActivity;
    var activityEl = null;
    var styles = self.props.styles;

    if (singleActivity.personal) {
      if (!singleActivity.byUser || !singleActivity.personal) return;
      var activityTime = moment(singleActivity.createdAt);
      var fromNow = activityTime.fromNow();
      if (singleActivity.type == 'investment') {
         activityEl = (
          <View style={styles.singleActivity}>
            <View style={styles.activityLeft}>
              <Text>
                <Text style={styles.active} onPress={self.setSelected.bind(self, singleActivity.byUser._id)}>
                  {singleActivity.byUser.name}
                </Text>
                &nbsp;invested {'$'+singleActivity.amount} in your post
                <Text numberOfLines={1} onPress={self.goToPost.bind(self, singleActivity)} style={styles.active}>
                {' ' + singleActivity.post.title}
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
            <Text>
              <Text style={styles.active} onPress={self.setSelected.bind(self, singleActivity.byUser._id)}>
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
              <Text>
                <Text style={styles.active} onPress={self.setSelected.bind(self, singleActivity.byUser._id)}>
                  {singleActivity.byUser.name}
                </Text>
                &nbsp;commented on your post
              </Text>
              <Text onPress={self.goToPost.bind(self, singleActivity)} numberOfLines={1} style={[styles.active]}>{singleActivity.post.title}</Text>
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
              <Text><Text style={styles.active} onPress={self.setSelected.bind(self, singleActivity.byUser._id)}>{singleActivity.byUser.name}</Text>&nbsp;is thirsty 4 u 👅💦</Text>
            </View>
            <View style={styles.activityRight}>
            <Text style={[styles.gray, styles.textRight]}>{fromNow}</Text>
            </View>
          </View>
        );
       } else {
          activityEl = (
            <View style={styles.singleActivity}>
              <Text>
              Notification from {singleActivity.byUser.name}
              </Text>
              <Text style={styles.gray}>{fromNow}</Text>
            </View>
          );
       }
    }

  if (!singleActivity.personal  && singleActivity.byUser._id != self.props.auth.user._id) {
    var activityTime = moment(singleActivity.createdAt);
    var fromNow = activityTime.fromNow();
    if (singleActivity.type == 'online') {
      activityEl = (
        <View style={styles.singleActivity}>
          <View style={styles.activityLeft}>
            <Text>
              <Text style={styles.active} onPress={self.setSelected.bind(self, singleActivity.byUser._id)}>
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






