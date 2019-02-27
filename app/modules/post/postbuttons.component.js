import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { browserAlerts } from 'app/utils/alert';
import PostButton from 'modules/post/postbutton.component';
import { View, NumericalValue } from 'modules/styled/uni';
import { colors } from 'app/styles';
import ReactTooltip from 'react-tooltip';
import { userVotePower } from 'server/config/globalConstants';

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
    earnings: PropTypes.object,
    color: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.vote = this.vote.bind(this);
    this.irrelevant = this.irrelevant.bind(this);
    this.share = this.share.bind(this);
  }

  componentDidMount() {
    if (ReactTooltip.rebuild) ReactTooltip.rebuild();
  }

  async vote(e, vote) {
    try {
      const { post, auth, actions } = this.props;
      e.preventDefault();
      e.stopPropagation();

      if (!auth.isAuthenticated) throw new Error('You must be logged in to upvote posts');

      const amount = 1;
      await actions.vote(amount, post, auth.user, vote);

      if (vote) return null;

      const upvoteAmount = userVotePower(auth.user.relevance.pagerank);

      this.investButton.measureInWindow((x, y, w, h) => {
        const parent = { x, y, w, h };
        if (x + y + w + h === 0) return;
        actions.triggerAnimation('upvote', { parent, amount: upvoteAmount });
      });

      // browserAlerts.alert('Success!');
      // TODO nalytics
      // Analytics.logEvent('upvote');
      return true;
    } catch (err) {
      return browserAlerts.alert(err.message);
    }
  }

  async irrelevant(e, vote) {
    try {
      const { post, auth, actions } = this.props;

      e.preventDefault();
      e.stopPropagation();

      if (!auth.isAuthenticated) return;
      await actions.vote(-1, post, auth.user, vote);

      // TODO animations
      // this.props.actions.triggerAnimation('vote', -1);
      // this.props.actions.triggerAnimation('irrelevant', -1);
    } catch (err) {
      browserAlerts.alert(err.message);
    }
  }

  async share(e) {
    e.preventDefault();
    return null;
  }

  render() {
    // TODO show tooltip here with pending earnigns and other stats
    // eslint-disable-next-line
    const { post, auth, community, className, earnings, myPostInv, color } = this.props;

    // let pendingPayouts = 0;
    // if (earnings) {
    //   earnings.pending.forEach(id => {
    //     const reward = earnings.entities[id];
    //     // TODO include actual rewards here based on % share
    //     if (reward && reward.post === post._id) pendingPayouts += reward.stakedTokens;
    //   });
    // }

    if (!post || post === 'notFound') return null;

    let vote;
    let votedUp;
    let votedDown;

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
        <View ref={c => (this.investButton = c)} align="center">
          <PostButton
            key={`${post.id}-up`}
            imageSet="UPVOTE"
            isActive={votedUp}
            alt="Upvote"
            color={color}
            onPress={e => this.vote(e, vote)}
          />
          <View p={'.75 0'}>
            <NumericalValue
              c={color || colors.secondaryText}
              fs={2}
              lh={1.8}
              data-place={'right'}
              data-for="mainTooltip"
              data-tip={JSON.stringify({
                type: 'TEXT',
                props: {
                  text: 'Upvote articles that are worth reading, downvote spam.'
                }
              })}
            >
              {post.data ? Math.round(post.data.relevance) : 0}
            </NumericalValue>
          </View>
          <PostButton
            key={`${post.id}-down`}
            imageSet="DOWNVOTE"
            isActive={votedDown}
            alt="downvote"
            color={color}
            onPress={e => this.irrelevant(e, vote)}
          />
        </View>
      </View>
    );
  }
}

export default PostButtons;
