import React, { Component } from 'react';
import {
  Text,
  View,
} from 'react-native';
import { globalStyles, fullWidth, fullHeight } from '../styles/global';
let moment = require('moment');

class Investment extends Component {
  constructor(props, context) {
    super(props, context);
    this.goToPost.bind(this);
  }

  setTagAndRoute(tag) {
    const self = this;
    self.props.actions.setTag(tag);
    self.props.navigator.resetTo({ name: 'discover' });
  }

  setSelected(user) {
    this.props.actions.setSelectedUser(user._id);
    this.props.navigator.push({
      key: 'profile',
      name: user.name,
      back: true,
      id: user._id,
    });
  }

  goToPost(post) {
    this.props.actions.setSelectedPost(post._id);
    this.props.navigator.push({
      key: 'singlePost',
      title: post.title,
      back: true
    });
  }

  render() {
    const self = this;
    let investment = self.props.investment;
    let investmentEl = null;
    let styles = self.props.styles;
    let postId = null;
    let time = null;
    let activityTime = null;
    if (self.props.investment.post) {
      if (self.props.investment.post._id) postId = self.props.investment.post._id;
      activityTime = moment(self.props.investment.createdAt);
      time = activityTime.fromNow();
    }
    if (investment) {
      investmentEl = (<View style={styles.singleActivity}>
        <View style={styles.activityLeft}>
          <Text style={styles.darkGray}>{investment.investor.name} invested {'$' + investment.amount} in <Text style={styles.active} onPress={() => self.setSelected(investment.poster)}>{investment.poster.name + "'s"}</Text> post
            <Text numberOfLines={1} onPress={postId ? () => self.goToPost(investment.post) : null} style={styles.active}>
            {postId ? ' ' + investment.post.title : null}
            </Text>
          </Text>
        </View>
        <View style={styles.activityRight}>
          <Text style={[styles.gray, styles.textRight]}>{time}</Text>
        </View>
      </View>);
    }

  return (
    <View>
      {investmentEl}
    </View>
  );
  }
}

export default Investment;
