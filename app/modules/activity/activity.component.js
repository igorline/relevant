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
  Image,
  Divider,
  InlineText
} from 'modules/styled/uni';
import ULink from 'modules/navigation/ULink.component';

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
    screenSize: PropTypes.number,
    PostComponent: PropTypes.func,
    navigation: PropTypes.object
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
    const { PostComponent, actions, auth, navigation } = this.props;
    const { post } = activity;

    const parentId = post.parentPost ? post.parentPost._id || post.parentPost : post._id;

    const link = post.metaPost || post.parentPost;
    // TODO hack should normalize in reducer
    // if (post.parentPost) post.parentPost = post.parentPost._id;
    const community = post.community || post.data ? post.data.community : null;
    const linkToPost = `/${community}/post/${parentId}`;

    const newCommunity = community !== auth.community ? community : null;
    const onPress = () => actions.goToPost({ _id: parentId, community: newCommunity });

    return (
      <ULink to={linkToPost} onPress={onPress}>
        <View m={['0 4', '0 2']}>
          <PostComponent
            post={post}
            link={link}
            hideDivider
            hidePostButtons
            preview
            // community={newCommunity}
            noLink
            navigation={navigation}
          />
        </View>
      </ULink>
    );
  }

  renderActivity(activity) {
    const { screenSize, actions } = this.props;
    const { emoji, image, byUser } = activityHelper.getActivityParams(activity);
    const amount = numbers.abbreviateNumber(activity.amount);
    return (
      <View flex={1} fdirection="row" align="center">
        <View alignself={'flex-start'} mr={1.5}>
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
          <View>{screenSize ? this.renderDate(activity) : null}</View>
        </View>
      </View>
    );
  }

  renderDate(activity) {
    const fromNow = numbers.getTimestamp(activity.createdAt);
    if (activity.type) {
      return <SecondaryText lh={2}>{fromNow}</SecondaryText>;
    }
    return null;
  }

  renderComment(activity) {
    const { PostComponent, navigation } = this.props;
    const { post, amount, byUser } = activity;

    post.embeddedUser = byUser;
    return (
      <View>
        <View m={['0 4', '0 2']}>
          <PostComponent
            post={post}
            hidePostButtons
            preview
            hideDivider
            navigation={navigation}
            avatarText={() => <ActivityText activity={activity} amount={amount} />}
          />
        </View>
        <Divider m={'2 0 0 0'} />
      </View>
    );
  }

  render() {
    const { screenSize } = this.props;
    const activity = this.props.singleActivity;
    if (!activity) return null;

    if (activity.type === 'comment') {
      return this.renderComment(activity);
    }

    return (
      <View>
        <View
          m={['4 4 0 4', '4 2 0 2']}
          fdirection="row"
          justify="space-between"
          align="center"
        >
          {this.renderActivity(activity)}
          {screenSize ? null : this.renderDate(activity)}
        </View>
        {activity.post ? (
          <View m={0} ml={[6, 5.5]} pr={0}>
            {this.renderPostPreview(activity)}
          </View>
        ) : (
          <View mt={[4, 0]} />
        )}
        <Divider m={'2 0 0 0'} />
      </View>
    );
  }
}
