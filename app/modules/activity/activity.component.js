import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { numbers } from 'app/utils';
import { colors } from 'app/styles';
import * as activityHelper from 'modules/activity/activityHelper';
import ActivityText from 'modules/activity/activityText.component';
import UAvatar from 'modules/user/UAvatar.component';
import RStat from 'modules/stats/rStat.component';
import {
  View,
  SecondaryText,
  BodyText,
  MobileDivider,
  Image,
  Divider,
  InlineText
} from 'modules/styled/uni';
import ULink from 'modules/navigation/ULink.component';

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
    mobile: PropTypes.bool,
    PostComponent: PropTypes.func
  };

  renderName(activity, user) {
    const { actions } = this.props;
    if (!user && activity.totalUsers) {
      let s = '';
      if (activity.totalUsers > 1) s = 's';
      return (
        <InlineText>
          {activity.totalUsers} user{s}{' '}
        </InlineText>
      );
    }
    if (!user) {
      return null;
    }

    if (user && user.handle && activity.totalUsers - 1) {
      let s = '';
      if (activity.totalUsers - 1 > 1) s = 's';
      return (
        <InlineText>
          <ULink
            onPress={() => actions.goToProfile(user)}
            to={'/user/profile/' + user.handle}
          >
            <BodyText c={colors.blue} inline={1}>
              @{user.handle}
            </BodyText>
          </ULink>
          <RStat inline={1} user={user} size={2} mr={0.5} align="baseline" />{' '}
          {activity.totalUsers - 1} other{s}
        </InlineText>
      );
    }
    if (user.handle) {
      return (
        <InlineText>
          <ULink
            onPress={() => actions.goToProfile(user)}
            to={'/user/profile/' + user.handle}
          >
            <BodyText c={colors.blue} inline={1}>
              @{user.handle}
            </BodyText>
          </ULink>{' '}
          <RStat inline={1} user={user} size={1.9} ml={0} mr={0} align="baseline" />{' '}
        </InlineText>
      );
    }
    return user.name;
  }

  renderIcon(img) {
    if (!img) {
      return null;
    }
    return <Image w={4} h={3.5} resizeMode={'contain'} source={img} />;
  }

  renderPostPreview(activity) {
    const { PostComponent, actions, auth, mobile } = this.props;
    const { post } = activity;

    const parentId = post.parentPost || post._id;
    const linkToPost = `/${auth.community}/post/${parentId}`;

    return (
      <ULink
        onPress={() => actions.goToPost({ _id: parentId })}
        to={linkToPost}
        noLink={!mobile}
      >
        <View>
          <PostComponent
            post={post}
            // comment={post}
            hidePostButtons
            link={post.metaPost}
            hideDivider
            preview
            noLink={mobile}
          />
        </View>
      </ULink>
    );
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
          <InlineText>
            {this.renderName(activity, byUser)}
            <ActivityText activity={activity} amount={amount} />
          </InlineText>
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

  renderComment(activity) {
    const { PostComponent } = this.props;
    const { post, amount, byUser } = activity;

    post.embeddedUser = byUser;

    return (
      <PostComponent
        post={post}
        hidePostButtons
        avatarText={() => <ActivityText activity={activity} amount={amount} />}
      />
    );
  }

  render() {
    const { mobile } = this.props;
    const activity = this.props.singleActivity;
    if (!activity) return null;

    const p = mobile ? 2 : 4;

    if (activity.type === 'comment') {
      return this.renderComment(activity);
    }

    return (
      <View>
        <View
          mr={p}
          ml={p}
          mt={4}
          mb={mobile ? 2 : 0}
          fdirection="row"
          justify="space-between"
          align="center"
        >
          {this.renderActivity(activity)}
          {mobile ? null : this.renderDate(activity)}
        </View>
        <View m={mobile ? '0 2 2 2' : 0} border={mobile}>
          {activity.post ? this.renderPostPreview(activity) : null}
        </View>
        {mobile ? <MobileDivider mt={p} /> : <Divider m={'0 4'} />}
      </View>
    );
  }
}
