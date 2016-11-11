import React, { Component } from 'react';
import {
  Text,
  View,
} from 'react-native';
import { globalStyles } from '../styles/global';

let moment = require('moment');

let styles = { ...globalStyles };

class Investment extends Component {
  constructor(props, context) {
    super(props, context);
    this.goToPost.bind(this);
  }

  setTagAndRoute(tag) {
    this.props.actions.setTag(tag);
    this.props.navigator.resetTo({ name: 'discover' });
  }

  setSelected(user) {
    this.props.navigator.goToProfile(user);
  }

  goToPost(post) {
    this.props.navigator.goToPost(post);
  }

  render() {
    let investment = this.props.investment;
    let investmentEl = null;
    let postId = null;
    let time = null;
    let activityTime = null;
    let investorName = null;
    let posterName = null;

    if (this.props.investment.post) {
      if (this.props.investment.post._id) postId = this.props.investment.post._id;
      activityTime = moment(this.props.investment.createdAt);
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

          <Text
            style={styles.darkGray}
          >
            {`${investorName} invested $${investment.amount} in `}
            <Text
              style={styles.active}
              onPress={() => this.setSelected(investment.poster)}
            >
              {`${posterName}'s `}
            </Text>
            post
            <Text
              numberOfLines={1}
              onPress={postId ? () => this.goToPost(investment.post) : null}
              style={styles.active}
            >
              {postId ? ` ${investment.post.title}` : null}
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
