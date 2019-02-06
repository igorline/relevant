import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { numbers } from 'app/utils';
import { colors } from 'app/styles';
import * as activityHelper from 'modules/activity/activityHelper';
import ActivityText from 'modules/activity/activityText.component';
import PostComponent from 'modules/post/web/post.component';
import UAvatar from 'modules/user/UAvatar.component';
import RStat from 'modules/stats/rStat.component';
import { View, SecondaryText, BodyText } from 'modules/styled/uni';
import ULink from 'modules/navigation/ULink.component';
// import styled from 'styled-components/primitives';

const moment = require('moment');

// const Capitalized = styled(BodyText)`
//   text-transform: capitalize;
// `;

export default class SingleActivity extends Component {
  static propTypes = {
    singleActivity: PropTypes.shape({
      totlaUsers: PropTypes.number,
      amount: PropTypes.number,
      byUser: PropTypes.object, // TODO create user prop type validation
      post: PropTypes.object, // TODO create post prop type validation
      type: PropTypes.string,
      text: PropTypes.string,
      createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
    }).isRequired,
    auth: PropTypes.shape({
      user: PropTypes.object.isRequired
    }).isRequired
  };

  renderName(activity, user) {
    if (!user && activity.totalUsers) {
      let s = '';
      if (activity.totalUsers > 1) s = 's';
      return (
        <span>
          {activity.totalUsers} user{s}
        </span>
      );
    }
    if (!user) {
      return null;
    }

    if (user && user.handle && activity.totalUsers - 1) {
      let s = '';
      if (activity.totalUsers - 1 > 1) s = 's';
      return (
        <View display="flex" fdirection="row" align="flex-end">
          <UAvatar user={user} size={4} mr={2} />
          <ULink to={'/user/profile/' + user.handle} mr={0.5} ml={1}>
            @{user.handle}
          </ULink>
          <RStat user={user} size={2} mr={0.5} ml={0.5} align="baseline" />
          {activity.totalUsers - 1} other{s}
        </View>
      );
    }
    if (user.handle) {
      return (
        <View display="flex" fdirection="row" align="center">
          <UAvatar user={user} size={4} noLink mr={2} />
          <ULink to={'/user/profile/' + user.handle} mr={0.5} ml={1}>
            @{user.handle}
          </ULink>
          <RStat user={user} size={2} mr={0.5} align="baseline" />
        </View>
      );
    }
    return user.name;
  }

  renderIcon(img) {
    if (!img) {
      return null;
    }
    return (
      <span
        style={{ backgroundImage: `url(/img/${img})` }}
        className={'avatar leftImage icon'}
      />
    );
  }

  renderPostPreview(activity) {
    const { post } = activity;
    if (!post.title && post.body) {
      post.title = post.body.substring(0, 130);
      if (post.body.length > 130) post.title += '...';
    }

    // TODO implement this
    // const linkToPost = `/${auth.community}/post/${postId}`;
    return <PostComponent post={post} link={post.metaPost} hideDivider />;
  }

  renderActivity(activity) {
    const { emoji, image, byUser } = activityHelper.getActivityParams(activity);
    const amount = numbers.abbreviateNumber(activity.amount);
    return (
      <View display="flex" fdirection="row" align="center">
        <span>{this.renderIcon(image)}</span>
        {emoji ? (
          <BodyText fs={3} lh={3} align="center">
            {emoji}
          </BodyText>
        ) : null}
        <span>{this.renderName(activity, byUser)}</span>
        <BodyText>
          <ActivityText activity={activity} amount={amount} />
        </BodyText>
      </View>
    );
  }

  renderBorder(activity) {
    const fromNow = moment(activity.createdAt).fromNow();
    if (activity.type) {
      return <SecondaryText>{fromNow}</SecondaryText>;
    }
    return <View />;
  }

  render() {
    const activity = this.props.singleActivity;
    if (!activity) return null;

    return (
      <View m={4}>
        <View display="flex" fdirection="row" justify="space-between" align="center">
          {this.renderActivity(activity)}
          {this.renderBorder(activity)}
        </View>
        <View border bg={colors.white} mt={1} pb={4}>
          {activity.post ? this.renderPostPreview(activity) : null}
        </View>
      </View>
    );
  }
}
