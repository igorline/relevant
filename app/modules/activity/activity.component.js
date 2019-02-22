import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { numbers } from 'app/utils';
import { colors } from 'app/styles';
import * as activityHelper from 'modules/activity/activityHelper';
import ActivityText from 'modules/activity/activityText.component';
import UAvatar from 'modules/user/UAvatar.component';
import RStat from 'modules/stats/rStat.component';
import { View, SecondaryText, BodyText, Divider, Text } from 'modules/styled/uni';
import ULink from 'modules/navigation/ULink.component';
import PostComponent from 'modules/post/web/post.component';
// import PostComponent from 'modules/post/postinfo.component';

const moment = require('moment');

export default class SingleActivity extends Component {
  static propTypes = {
    actions: PropTypes.object,
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
    }).isRequired,
    mobile: PropTypes.bool
  };

  renderName(activity, user) {
    const { actions } = this.props;
    if (!user && activity.totalUsers) {
      let s = '';
      if (activity.totalUsers > 1) s = 's';
      return (
        <Text inline>
          {activity.totalUsers} user{s}{' '}
        </Text>
      );
    }
    if (!user) {
      return null;
    }

    if (user && user.handle && activity.totalUsers - 1) {
      let s = '';
      if (activity.totalUsers - 1 > 1) s = 's';
      return (
        <Text inline>
          <ULink
            onPress={() => actions.goToProfile(user)}
            to={'/user/profile/' + user.handle}
          >
            <BodyText c={colors.blue} inline>
              @{user.handle}
            </BodyText>
          </ULink>
          <RStat inline user={user} size={2} mr={0.5} align="baseline" />{' '}
          {activity.totalUsers - 1} other{s}
        </Text>
      );
    }
    if (user.handle) {
      return (
        <Text inline>
          <ULink
            onPress={() => actions.goToProfile(user)}
            to={'/user/profile/' + user.handle}
          >
            <BodyText c={colors.blue} inline>
              @{user.handle}
            </BodyText>
          </ULink>{' '}
          <RStat inline user={user} size={1.9} ml={0} mr={0} align="baseline" />{' '}
        </Text>
      );
    }
    return user.name;
  }

  renderIcon(img) {
    if (!img) {
      return null;
    }
    return <Image w={4} h={4} resizeMode={'contain'} source={img} />;
  }

  renderPostPreview(activity) {
    const { post } = activity;
    if (!post.title && post.body) {
      post.title = post.body.substring(0, 130);
      if (post.body.length > 130) post.title += '...';
    }

    // TODO implement this
    // const linkToPost = `/${auth.community}/post/${postId}`;
    return <PostComponent post={post} hidePostButtons link={post.metaPost} hideDivider />;
  }

  renderActivity(activity) {
    const { mobile, actions } = this.props;
    const { emoji, image, byUser } = activityHelper.getActivityParams(activity);
    const amount = numbers.abbreviateNumber(activity.amount);
    return (
      <View flex={1} fdirection="row" align="center">
        <View alignself={'flex-start'} mr={1}>
          {this.renderIcon(image)}
          {emoji ? (
            <BodyText fs={4} lh={4.2} pt={1} align="baseline">
              {emoji}
            </BodyText>
          ) : null}
          {byUser && <UAvatar goToProfile={actions.goToProfile} user={byUser} size={4} />}
        </View>
        <View flex={1} fdirection={'column'} align="baseline">
          <Text inline>
            {this.renderName(activity, byUser)}
            <ActivityText activity={activity} amount={amount} />
          </Text>
          <View>{mobile ? this.renderDate(activity) : null}</View>
        </View>
      </View>
    );
  }

  renderDate(activity) {
    const fromNow = moment(activity.createdAt).fromNow();
    if (activity.type) {
      return <SecondaryText lh={2}>{fromNow}</SecondaryText>;
    }
    return null;
  }

  render() {
    const { mobile } = this.props;
    const activity = this.props.singleActivity;
    if (!activity) return null;

    const p = mobile ? 2 : 4;

    return (
      <View m={p}>
        <View display="flex" fdirection="row" justify="space-between" align="center">
          {this.renderActivity(activity)}
          {mobile ? null : this.renderDate(activity)}
        </View>
        <View bg={colors.white} mt={2}>
          {activity.post ? this.renderPostPreview(activity) : null}
          <Divider mt={p} />
        </View>
      </View>
    );
  }
}
