import React, { Component } from 'react';
import { Link } from 'react-router';
import { numbers } from '../../../utils';
import * as activityHelper from '../../../components/activity/activityHelper';
import PostInfo from '../post/postinfo.component';

let moment = require('moment');

export default class SingleActivity extends Component {
  renderName(activity, user) {
    if (!user && activity.totalUsers) {
      let s = '';
      if (activity.totalUsers > 1) s = 's';
      return <span>{activity.totalUsers} user{s}</span>;
    }

    if (user && activity.totalUsers - 1) {
      let s = '';
      if (activity.totalUsers - 1 > 1) s = 's';
      return (<div>
        <Link to={'/profile/' + user._id} >
          {user.name}{' '}
        </Link>
         and {activity.totalUsers - 1} other{s}
      </div>);
    }

    return (
      <Link to={'/profile/' + user._id} >
        {user.name}{' '}
      </Link>
    );
  }

  renderStat(activity) {
    let amount = numbers.abbreviateNumber(activity.amount);
    let coinAmount = numbers.abbreviateNumber(activity.coin);

    let { coin, relevance } = activityHelper.getStatParams(activity);
    let icon = 'rup.png';
    let color = 'green';

    if (amount <= 0) return null;

    if (activity.amount < 0) {
      color = 'red';
      icon = 'rdown.png';
    }
    if (coin) {
      return (<div className={'stat ' + color}>
        <img src='/img/coinup.png'/>
        <div>{coinAmount}</div>
      </div>);
    }
    if (relevance) {
      return (<div className={'stat ' + color}>
        <img src={`/img/${icon}`}/>
        <div>{amount}</div>
      </div>);
    }

    return <div className={'stat'}></div>;
  }


  renderIcon(img) {
    return <span
      style= {{ backgroundImage: `url(/img/${img})` }}
      className={'avatar leftImage icon'}
    />;
  }

  renderUserImage(activity) {
    let user = activity.byUser;
    let url = user.image ? user.image : '/img/default_user.jpg';
    return (
      <Link to={'/profile/' + user._id} >
        <span style= {{ backgroundImage: `url(${url})` }} className={'avatar leftImage'} />
      </Link>
    );
  }

  renderPostPreview(activity) {
    let { auth } = this.props;
    let { post } = activity;

    let postId = post._id;
    if (post.type === 'comment') postId = post.parentPost;

    if (!post.title && post.body) {
      post.title = post.body.substring(0, 130);
      if (post.body.length > 130) post.title += '...';
    }
    return <PostInfo
      link={`/${auth.community}/post/${postId}`}
      className={'activityPreview'}
      preview post={post}
    />;
  }

  renderActivity(activity) {
    let { emoji, userImage, post, image, userName } = activityHelper.getActivityParams(activity);
    let amount = numbers.abbreviateNumber(activity.amount);
    let coinAmount = numbers.abbreviateNumber(activity.coin);

    if (activity.type === 'reward') {
      console.log(activity);
    }

    return (<div className={'activityInner'}>
      <div className={'topRow'}>
        {userImage ? this.renderUserImage(activity) : null }
        {image ? this.renderIcon(image) : null }
        {emoji ?
          <span className={'activityEmoji'}>
            {emoji}
          </span> : null
        }
        <span className={'activityText'}>
          {userName ? this.renderName(activity, userName) : null}
          {activityHelper.getText(activity, amount, coinAmount)}
        </span>
        {this.renderStat(activity)}
      </div>
      {post ? this.renderPostPreview(activity) : null}
    </div>);
  }

  renderBorder(activity) {
    let fromNow = moment(activity.createdAt).fromNow();
    if (activity.type) {
      return (<div className={'time'}>
        <div className={'border'} />
        <span>
          {fromNow}
        </span>
      </div>);
    }
    return null;
  }

  render() {
    let activity = this.props.singleActivity;
    if (!activity) return null;

    return (
      <div key={activity._id} className={'activityItem'}>
        <div>
          {this.renderActivity(activity)}
        </div>
        <div>
          {this.renderBorder(activity)}
        </div>
      </div>
    );
  }
}
