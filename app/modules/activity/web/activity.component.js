import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { numbers } from 'app/utils';
import * as activityHelper from 'modules/activity/activityHelper';
import PostInfo from 'modules/post/postinfo.component';

const moment = require('moment');

export default class SingleActivity extends Component {
  static propTypes = {
    singleActivity: PropTypes.shape({
      totlaUsers: PropTypes.number,
      amount: PropTypes.number,
      byUser: PropTypes.object, // TODO create user prop type validation
      post: PropTypes.object, // TODO create post prop type validation
      type: PropTypes.string,
      text: PropTypes.string,
      createdAt: PropTypes.object
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

    if (user && activity.totalUsers - 1) {
      let s = '';
      if (activity.totalUsers - 1 > 1) s = 's';
      return (
        <div>
          <Link to={'/user/profile/' + user.handle}>{user.name} </Link>
          and {activity.totalUsers - 1} other{s}
        </div>
      );
    }

    return <Link to={'/user/profile/' + user.handle}>{user.name} </Link>;
  }

  renderStat(activity) {
    const amount = numbers.abbreviateNumber(activity.amount);
    const coinAmount = numbers.abbreviateNumber(activity.coin);

    const { coin, relevance } = activityHelper.getStatParams(activity);
    let icon = 'rup.png';
    let color = 'green';

    if (amount <= 0) return null;

    if (activity.amount < 0) {
      color = 'red';
      icon = 'rdown.png';
    }
    if (coin) {
      return (
        <div className={'stat ' + color}>
          <img src="/img/coinup.png" />
          <div>{coinAmount}</div>
        </div>
      );
    }
    if (relevance) {
      return (
        <div className={'stat ' + color}>
          <img src={`/img/${icon}`} />
          <div>{amount}</div>
        </div>
      );
    }

    return <div className={'stat'} />;
  }

  renderIcon(img) {
    return (
      <span
        style={{ backgroundImage: `url(/img/${img})` }}
        className={'avatar leftImage icon'}
      />
    );
  }

  renderUserImage(activity) {
    const user = activity.byUser;
    const url = user.image ? user.image : '/img/default_user.jpg';
    return (
      <Link to={'/user/profile/' + user.handle}>
        <span style={{ backgroundImage: `url(${url})` }} className={'avatar leftImage'} />
      </Link>
    );
  }

  renderPostPreview(activity) {
    const { auth } = this.props;
    const { post } = activity;

    let postId = post._id;
    if (post.type === 'comment') postId = post.parentPost;

    if (!post.title && post.body) {
      post.title = post.body.substring(0, 130);
      if (post.body.length > 130) post.title += '...';
    }
    return (
      <PostInfo
        link={`/${auth.community}/post/${postId}`}
        className={'activityPreview'}
        preview
        post={post}
      />
    );
  }

  renderActivity(activity) {
    const { emoji, userImage, post, image, userName } = activityHelper.getActivityParams(
      activity
    );
    const amount = numbers.abbreviateNumber(activity.amount);
    const coinAmount = numbers.abbreviateNumber(activity.coin);

    return (
      <div className={'activityInner'}>
        <div className={'topRow'}>
          {userImage ? this.renderUserImage(activity) : null}
          {image ? this.renderIcon(image) : null}
          {emoji ? <span className={'activityEmoji'}>{emoji}</span> : null}
          <span className={'activityText'}>
            {userName ? this.renderName(activity, userName) : null}
            {activityHelper.getText(activity, amount, coinAmount)}
          </span>
          {this.renderStat(activity)}
        </div>
        {post ? this.renderPostPreview(activity) : null}
      </div>
    );
  }

  renderBorder(activity) {
    const fromNow = moment(activity.createdAt)
    .fromNow();
    if (activity.type) {
      return (
        <div className={'time'}>
          <div className={'border'} />
          <span>{fromNow}</span>
        </div>
      );
    }
    return null;
  }

  render() {
    const activity = this.props.singleActivity;
    if (!activity) return null;

    return (
      <div key={activity._id} className={'activityItem'}>
        <div>{this.renderActivity(activity)}</div>
        <div>{this.renderBorder(activity)}</div>
      </div>
    );
  }
}
