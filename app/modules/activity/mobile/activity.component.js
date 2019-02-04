import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  Image,
  TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';
import { numbers } from 'app/utils';
import {
  globalStyles,
  fullWidth,
  green,
  smallScreen,
  greyText,
  mainPadding
} from 'app/styles/global';
import UrlPreview from 'modules/createPost/mobile/urlPreview.component';
import * as activityHelper from 'modules/activity/activityHelper';

const moment = require('moment');

let styles;

export default class SingleActivity extends Component {
  static propTypes = {
    actions: PropTypes.object,
    posts: PropTypes.object,
    singleActivity: PropTypes.object
  };

  toggleTooltip(name, type) {
    const { tooltipParent } = this;
    if (!tooltipParent[name]) return;
    tooltipParent[name].measureInWindow((x, y, w, h) => {
      const parent = { x, y, w, h };
      if (x + y + w + h === 0) return;
      this.props.actions.setTooltipData({
        name,
        parent,
        type
      });
      this.props.actions.showTooltip(name);
    });
  }

  setSelected(user) {
    this.props.actions.goToProfile(user);
  }

  goToPost(post) {
    this.props.actions.goToPost(post);
  }

  renderName(activity, user) {
    if (!user && activity.totalUsers) {
      let s = '';
      if (activity.totalUsers > 1) s = 's';
      return (
        <Text style={styles.activityText}>
          {activity.totalUsers} user{s}{' '}
        </Text>
      );
    }

    if (user && activity.totalUsers - 1) {
      let s = '';
      if (activity.totalUsers - 1 > 1) s = 's';
      return (
        <Text style={styles.activityText}>
          <Text
            style={[styles.link, styles.activityText]}
            onPress={() => this.setSelected(user)}
          >
            {user.name}{' '}
          </Text>
          and {activity.totalUsers - 1} other{s}
        </Text>
      );
    }

    return (
      <Text
        style={[styles.link, styles.activityText]}
        onPress={() => this.setSelected(user)}
      >
        {user.name}{' '}
      </Text>
    );
  }

  renderStat(activity) {
    if (activity.amount <= 0) return null;
    const { coin, relevance } = activityHelper.getStatParams(activity);
    let icon = require('app/public/img/rup.png');
    let color = { color: green };
    if (activity.amount < 0) {
      color = { color: 'red' };
      icon = require('app/public/img/rdown.png');
    }
    this.tooltipParent = {};

    if (coin) {
      return (
        <View
          style={[smallScreen ? styles.activityMiddleSmall : styles.activityMiddle]}
          // ref={(c) => this.tooltipParent.activity = c}
          onLayout={() => null}
        >
          <TouchableOpacity
            key={activity._id}
            onPress={() => this.toggleTooltip('activity')}
            allowFontScaling={false}
            style={styles.textRow}
          >
            <Image
              resizeMode={'contain'}
              style={[styles.r, { height: 15, width: 22 }]}
              source={require('app/public/img/coinup.png')}
            />
            <Text style={[styles.bebas, color, { lineHeight: 17, fontSize: 17 }]}>
              {numbers.abbreviateNumber(Math.abs(activity.coin))}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (relevance) {
      return (
        <View
          style={[smallScreen ? styles.activityMiddleSmall : styles.activityMiddle]}
          ref={c => (this.tooltipParent.activity = c)}
          onLayout={() => null}
        >
          <TouchableOpacity
            onPress={() => this.toggleTooltip('activity', activity.type)}
            allowFontScaling={false}
            style={styles.textRow}
          >
            <Image
              resizeMode={'contain'}
              style={[styles.r, { height: 16, width: 20 }]}
              source={icon}
            />
            <Text style={[styles.bebas, color, { lineHeight: 17, fontSize: 17 }]}>
              {Math.abs(numbers.abbreviateNumber(activity.amount))}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return <View style={[styles.activityMiddle]} />;
  }

  renderIcon(img) {
    return (
      <View style={styles.activityImage}>
        <Image resizeMode={'contain'} style={styles.activityImage} source={img} />
      </View>
    );
  }

  renderUserImage(activity) {
    const user = activity.byUser;
    const image = user.image
      ? { uri: user.image }
      : require('app/public/img/default_user.jpg');
    return (
      <TouchableWithoutFeedback onPress={() => this.setSelected(activity.byUser)}>
        <Image style={styles.activityImage} source={image} />
      </TouchableWithoutFeedback>
    );
  }

  renderPostPreview(activity) {
    const { post } = activity;
    const { posts } = this.props;
    if (!post) return null;
    const link = posts.links[post.metaPost];
    const previewProps = { urlPreview: link || post, post };
    const goTo = !post.parentPost ? post : { _id: post.parentPost };
    return (
      <View style={{ marginLeft: 55, marginRight: mainPadding }}>
        <UrlPreview
          onPress={() => this.goToPost(goTo)}
          size={'small'}
          {...previewProps}
        />
      </View>
    );
  }

  renderActivity(activity) {
    const { emoji, userImage, post, image, userName } = activityHelper.getActivityParams(
      activity
    );
    const amount = numbers.abbreviateNumber(activity.amount);
    const coinAmount = numbers.abbreviateNumber(activity.coin);

    return (
      <View>
        <View style={[styles.singleActivity]}>
          <View style={styles.activityLeft}>
            {userImage && this.renderUserImage(activity)}
            {image && this.renderIcon(image)}
            {emoji && (
              <Text allowFontScaling={false} style={styles.incomeEmoji}>
                {emoji}
              </Text>
            )}
            <Text style={[{ flex: 1 }, styles.activityText]}>
              {userName && this.renderName(activity, userName)}
              {activityHelper.getText(activity, amount, coinAmount)}
            </Text>
            {this.renderStat(activity)}
          </View>
        </View>
        {post && this.renderPostPreview(activity)}
      </View>
    );
  }

  renderBorder(activity) {
    const fromNow = moment(activity.createdAt)
    .fromNow();
    if (activity.type) {
      return (
        <View style={styles.time}>
          <View style={styles.border} />
          <Text
            style={[
              {
                paddingHorizontal: 5,
                // marginBottom: -6,
                fontSize: 10,
                color: greyText,
                textAlign: 'center',
                backgroundColor: 'white'
              }
            ]}
          >
            {fromNow}
          </Text>
        </View>
      );
    }
    return null;
  }

  render() {
    const activity = this.props.singleActivity;
    if (!activity) return null;
    return (
      <View>
        <View>{this.renderActivity(activity)}</View>
        {this.renderBorder(activity)}
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  divide: {
    width: 25,
    margin: 2
  },
  activityText: {
    fontSize: 15,
    fontFamily: 'Georgia'
  },
  time: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15
  },
  border: {
    alignItems: 'center',
    borderBottomColor: '#dddddd',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 60,
    position: 'absolute',
    width: fullWidth - 120,
    bottom: 6
  },
  singleActivity: {
    padding: mainPadding,
    paddingTop: 15,
    width: fullWidth,
    justifyContent: 'space-between',
    flexDirection: 'column',
    alignItems: 'stretch',
    flex: 1,
    overflow: 'visible'
  },
  activityMiddleSmall: {
    flex: 0.16,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 3
  },
  activityMiddle: {
    flex: 0.25,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 5
  },
  activityRight: {
    flex: 0.1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    marginLeft: 5
  },
  activityLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  link: {
    color: '#4d4eff'
  },
  incomeEmoji: {
    width: 30,
    height: 30,
    marginRight: 10,
    textAlign: 'center',
    fontSize: 24
  },
  activityImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10
  },
  activityImagePlaceholder: {
    height: 30,
    width: 30,
    marginRight: 10,
    backgroundColor: 'lightgrey',
    borderRadius: 15
  }
});
styles = { ...localStyles, ...globalStyles };
