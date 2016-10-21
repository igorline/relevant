'use strict';
import React, { Component } from 'react';
import {
  Text,
  View,
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
let moment = require('moment');

class Investment extends Component {
  constructor (props, context) {
    super(props, context);
    this.state = {
    };
  }

  setTagAndRoute(tag) {
    const self = this;
    self.props.actions.setTag(tag);
    self.props.navigator.resetTo({ name: 'discover' });
  }

  setSelected(user) {
    self.props.actions.setSelectedUser(user._id);
    self.props.navigator.push({
      key: 'profile',
      name: user.name,
      back: true,
    });
  }

  goToPost(id) {
    this.props.actions.getActivePost(id)
    .then(() => {
      this.props.navigator.push({
        key: 'singlePost',
        title: 'Post',
        back: true
      });
    });
  }

  render() {
    var self = this;
    var investment = self.props.investment;
    var investmentEl = null;
    var styles = self.props.styles;
    var postId = null;
    var time = null;
    if (self.props.investment.post) {
      if (self.props.investment.post._id) postId = self.props.investment.post._id;
      var activityTime = moment(self.props.investment.createdAt);
      time = activityTime.fromNow();
    }
    if (investment) {
      investmentEl = (<View style={styles.singleActivity}>
        <View style={styles.activityLeft}>
          <Text style={styles.darkGray}>{investment.investor.name} invested {'$'+investment.amount} in <Text style={styles.active} onPress={self.setSelected.bind(self, investment.poster)}>{investment.poster.name+"'s"}</Text> post
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






