import React, { Component } from 'react';
import {
  Text,
  View,
} from 'react-native';
import { globalStyles } from '../styles/global';

let moment = require('moment');

let styles = { ...globalStyles };

export default function (props) {
  let investment = props.investment;
  if (!investment) return null;
  let investmentEl = null;
  let postId = null;
  let time = null;
  let activityTime = null;
  let investorName = null;
  let posterName = null;
  let postTitle = 'Untitled';
  let post = null;

  let timeSince = (date) => {
    let seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);
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

  let setTagAndRoute = (tag) => {
    props.actions.setTag(tag);
    props.navigator.resetTo({ name: 'discover' });
  };

  let setSelected = (user) => {
    props.navigator.goToProfile(user);
  };

  let goToPost = (post) => {
    props.navigator.goToPost(post);
  };

  if (props.investment.post) {
    post = props.investment.post;
    if (post.title) {
      postTitle = post.title;
    } else if (post.body) {
      postTitle = post.body.substring(0, 20);
    }
    
    if (post._id) postId = post._id;
  }

  activityTime = moment(props.investment.createdAt);
  time = timeSince(activityTime);

  if (investment.investor) {
    if (investment.investor.name) investorName = investment.investor.name;
  }

  if (investment.poster) {
    if (investment.poster.name) posterName = investment.poster.name;
  }

  investmentEl = (<View style={[styles.singleActivity]}>
    <View style={styles.activityLeft}>
      <Text
        style={[styles.darkGray, styles.georgia]}
        numberOfLines={2}
      >
        {`${investorName} invested $${investment.amount} in `}
        <Text
          style={{}}
          onPress={() => setSelected(investment.poster)}
        >
          {`${posterName}'s `}
        </Text>
        post
        <Text
          onPress={postId ? () => goToPost(investment.post) : null}
          style={{ fontStyle: 'italic' }}
        >
          &nbsp;{postTitle}
        </Text>
      </Text>
    </View>
    <View style={[styles.activityRight]}>
      <Text style={{ color: '#B0B3B6' }}>
        {time}
      </Text>
    </View>
  </View>);

  return investmentEl;
}
