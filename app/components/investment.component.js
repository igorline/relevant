'use strict';
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableHighlight,
  LinkingIOS
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
var moment = require('moment');

class Investment extends Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
    }
  }

  goToPost(id) {
    var self = this;
    self.props.actions.getActivePost(id).then(function() {
      self.props.navigator.push({name: 'singlePost'});
    })
  }

  setTagAndRoute(tag) {
    var self = this;
    self.props.actions.setTag(tag);
    self.props.navigator.resetTo({name: 'discover'});
  }

  setSelected(id) {
    var self = this;
    if (typeof id == 'object') {
      var set = id._id;
    } else {
      var set = id;
    }

    // if (set == self.props.auth.user._id) {
    //   //self.props.actions.clearSelectedUser();
    //   self.props.navigator.push({name: 'profile'});
    // } else {
    //   self.props.actions.clearSelectedUser();
      self.props.actions.setSelectedUser(set);
      self.props.navigator.push({name: 'profile'});
    // }
  }

  render() {
    var self = this;
    var investment = self.props.investment;
    var investmentEl = null;
    var styles = self.props.styles;
    var postId = null;
    var time = null;

    //console.log(self.props.investment)
    if (self.props.investment.post) {
      if (self.props.investment.post._id) postId = self.props.investment.post._id;
      var activityTime = moment(self.props.investment.createdAt);
      time = activityTime.fromNow();
    }
    if (investment) {
      investmentEl = (<View style={styles.singleActivity}>
        <View style={styles.activityLeft}>
          <Text style={styles.darkGray}>{investment.investor.name} invested {'$'+investment.amount} in <Text style={styles.active} onPress={self.setSelected.bind(self, investment.poster._id)}>{investment.poster.name+"'s"}</Text> post
            <Text numberOfLines={1} onPress={postId ? self.goToPost.bind(self, investment.post._id) : null} style={styles.active}>
            {postId ? ' '+investment.post.title : null}
            </Text>
          </Text>
        </View>
        <View style={styles.activityRight}>
          <Text style={[styles.gray, styles.textRight]}>{time}</Text>
        </View>
      </View>)
    }

  return (
      <View>
        {investmentEl}
      </View>
    );
  }
}

export default Investment;






