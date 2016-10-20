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

  setSelected(id) {
    const self = this;
    let set = null;
    if (typeof id === 'object') {
      set = id._id;
    } else {
      set = id;
    }
    self.props.actions.setSelectedUser(set);
    self.props.navigator.push({ name: 'profile' });
  }

  goToPost(id) {
    const self = this;
    self.props.actions.setSelectedPost(id);
    self.props.navigator.push({ name: 'singlePost' });
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
          <Text style={styles.darkGray}>{investment.investor.name} invested {'$'+investment.amount} in <Text style={styles.active} onPress={() => self.setSelected(investment.poster._id)}>{investment.poster.name+"'s"}</Text> post
            <Text numberOfLines={1} onPress={postId ? () => self.goToPost(investment.post._id) : null} style={styles.active}>
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






