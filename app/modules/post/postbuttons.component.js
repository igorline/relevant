import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { browserAlerts } from 'app/utils/alert';
import PostButton from 'modules/post/postbutton.component';
import { View, NumericalValue } from 'modules/styled/uni';
import { colors } from 'app/styles';

class PostButtons extends Component {
  static propTypes = {
    auth: PropTypes.object,
    myPostInv: PropTypes.object,
    post: PropTypes.shape({
      data: PropTypes.object
    }),
    community: PropTypes.object,
    actions: PropTypes.object,
    className: PropTypes.string,
    earnings: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.vote = this.vote.bind(this);
    this.irrelevant = this.irrelevant.bind(this);
    this.share = this.share.bind(this);
  }

  async vote(e, vote) {
    try {
      e.preventDefault();
      e.stopPropagation();

      if (!this.props.auth.isAuthenticated) return null;

      const amount = 1;
      await this.props.actions.vote(amount, this.props.post, this.props.auth.user, vote);
      // browserAlerts.alert('Success!');

      // TODO animation & analytics
      // Analytics.logEvent('upvote');
      // this.props.actions.triggerAnimation('vote');
      // setTimeout(() => {
      //   // this.props.actions.reloadTab('read');
      //   let name = this.props.post.embeddedUser.name;
      //   browserAlerts.alert('You have subscribed to receive '
      //   + results.subscription.amount + ' posts from ' + name);
      // }, 1500);
    } catch (err) {
      // TODO error handling
    }
    return null;
  }

  async irrelevant(e, vote) {
    try {
      e.preventDefault();
      e.stopPropagation();

      if (!this.props.auth.isAuthenticated) return;
      // for testing
      // this.props.actions.triggerAnimation('vote', -1);
      // this.props.actions.triggerAnimation('irrelevant', -1);
      // return;

      await this.props.actions.vote(-1, this.props.post, this.props.auth.user, vote);
      // browserAlerts.alert('Success!');

      // TODO animations
      // this.props.actions.triggerAnimation('vote', -1);
      // this.props.actions.triggerAnimation('irrelevant', -1);
    } catch (err) {
      // TODO error handling
      browserAlerts.alert(err.message);
    }
  }

  async share(e) {
    e.preventDefault();
    return null;
  }

  render() {
    // eslint-disable-next-line
    const { post, auth, community, className, earnings, myPostInv } = this.props;

    // let pendingPayouts = 0;
    // if (earnings) {
    //   earnings.pending.forEach(id => {
    //     const reward = earnings.entities[id];
    //     // TODO include actual rewards here based on % share
    //     if (reward && reward.post === post._id) pendingPayouts += reward.stakedTokens;
    //   });
    // }

    if (post === 'notFound') {
      return null;
    }
    if (!post) return null;

    let vote;
    let votedUp;
    let votedDown;
    // let buttonOpacity = { opacity: 1 };
    // let upvoteBtn = '/img/upvote.png';
    // const upvoteBtn = '/img/uparrow-blue.png';

    // let downVoteBtn = '/img/downvote-red.svg';

    if (this.props.myPostInv) {
      vote = myPostInv[post.id] || !this.props.auth.isAuthenticated;
      if (auth.user && auth.user._id === post.user) vote = true;
      if (vote) {
        votedUp = vote.amount > 0;
        votedDown = vote.amount < 0;
      }
    }

    return (
      <View className={className}>
        <View align="center">
          <PostButton
            key={`${post.id}-up`}
            imageSet="UPVOTE"
            isActive={votedUp}
            alt="Upvote"
            onPress={e => this.vote(e, vote)}
          />
          <View m={'1 0'}>
            <NumericalValue c={colors.secondaryText} fs={2}>
              {post.data ? Math.round(post.data.relevance) : null}
            </NumericalValue>
          </View>
          <PostButton
            key={`${post.id}-down`}
            imageSet="DOWNVOTE"
            isActive={votedDown}
            alt="downvote"
            onPress={e => this.irrelevant(e, vote)}
          />
        </View>
      </View>
    );
  }
}

export default PostButtons;
