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
    this.props.navigator.goToProfile(user);
  }

  goToPost(post) {
    // this.props.actions.setSelectedPost(post._id);
    this.props.navigator.goToPost(post);
  }

  render() {
    const self = this;
    let investment = self.props.investment;
    let investmentEl = null;
    let styles = self.props.styles;
    let postId = null;
    let time = null;
    let activityTime = null;
    let investorName = null;
    let posterName = null;

    if (self.props.investment.post) {
      if (self.props.investment.post._id) postId = self.props.investment.post._id;
      activityTime = moment(self.props.investment.createdAt);
      time = activityTime.fromNow();
    }
    if (investment) {
      if (investment.investor) {
        if (investment.investor.name) investorName = investment.investor.name;
      }

      if (investment.poster) {
        if (investment.poster.name) posterName = investment.poster.name;
      }

      investmentEl = (<View style={styles.singleActivity}>
        <View style={styles.activityLeft}>

          <Text style={styles.darkGray}>{investorName} invested {'$' + investment.amount} in <Text style={styles.active} onPress={() => self.setSelected(investment.poster)}>{posterName + "'s"}</Text> post
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