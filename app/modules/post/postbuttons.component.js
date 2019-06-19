import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { browserAlerts } from 'app/utils/alert';
import PostButton from 'modules/post/postbutton.component';
import { View, NumericalValue } from 'modules/styled/uni';
import { colors } from 'app/styles';
import get from 'lodash.get';
import ReactTooltip from 'react-tooltip';

let Analytics;
let ReactGA;
if (process.env.WEB !== 'true') {
  Analytics = require('react-native-firebase-analytics');
} else {
  ReactGA = require('react-ga').default;
}

class PostButtons extends Component {
  static propTypes = {
    auth: PropTypes.object,
    // myPostInv: PropTypes.object,
    post: PropTypes.shape({
      data: PropTypes.object
    }),
    // community: PropTypes.object,
    actions: PropTypes.object,
    className: PropTypes.string,
    // earnings: PropTypes.object,
    color: PropTypes.string,
    horizontal: PropTypes.bool
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
    const { Dimensions } = require('react-native');
    this.fullHeight = Dimensions.get('window').height;
    this.initTooltips();
  }

  initTooltips = () => {
    if (!get(this.props, 'actions.setTooltipData')) return;
    ['vote'].forEach(name => {
      this.props.actions.setTooltipData({
        name,
        toggle: () => this.toggleTooltip(name)
      });
    });
  };

  toggleTooltip = name => {
    if (!this.props.actions.setTooltipData) return;
    if (!this.investButton) return;
    this.investButton.measureInWindow((x, y, w, h) => {
      const parent = { x, y, w, h };
      if (x + y + w + h === 0) return;
      if (y > this.fullHeight - 50) return;
      this.props.actions.setTooltipData({
        name,
        parent
      });
      this.props.actions.showTooltip(name);
    });
  };

  async vote(e, vote) {
    try {
      const { post, auth, actions } = this.props;
      e.preventDefault();
      e.stopPropagation();

      if (!auth.isAuthenticated) throw new Error('You must be logged in to upvote posts');

      const amount = 1;
      const voteResult = await actions.vote(amount, post, auth.user, vote);

      if (!voteResult || voteResult.undoInvest) return null;

      const startRank = post.data ? post.data.pagerank : 0;
      const total = startRank + voteResult.rankChange + 1;
      const upvoteAmount = Math.round(total) - Math.round(startRank);

      this.investButton.measureInWindow((x, y, w, h) => {
        const parent = { x, y, w, h };
        if (x + y + w + h === 0) return;
        actions.triggerAnimation('upvote', { parent, amount: upvoteAmount });
      });

      Analytics && Analytics.logEvent('upvote');
      ReactGA &&
        ReactGA.event({
          category: 'User',
          action: 'Upvoted a Post'
        });
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
      ReactGA.event({
        category: 'User',
        action: 'Downvoted a Post'
      });
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
    const {
      post,
      auth,
      // community,
      className,
      // earnings,
      // myPostInv,
      color,
      horizontal
    } = this.props;

    // let pendingPayouts = 0;
    // if (earnings) {
    //   earnings.pending.forEach(id => {
    //     const reward = earnings.entities[id];
    //     // TODO include actual rewards here based on % share
    //     if (reward && reward.post === post._id) pendingPayouts += reward.stakedTokens;
    //   });
    // }

    if (!post || post === 'notFound') return null;

    const ownPost = auth.user && auth.user._id === post.user;
    const vote = ownPost ? true : post.myVote;
    const votedUp = vote && vote.amount > 0;
    const votedDown = vote && vote.amount < 0;

    const postRank = post.data
      ? Math.round(post.data.pagerank) + post.data.upVotes - post.data.downVotes
      : 0;

    return (
      <View className={className}>
        <View
          ref={c => (this.investButton = c)}
          onLayout={() => {}}
          align="center"
          fdirection={horizontal ? 'row' : 'column'}
          style={{ opacity: 1 }} // need this to make animations work on android
        >
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
              onPress={() => this.toggleTooltip('vote')}
              c={color || colors.secondaryText}
              fs={2}
              lh={2}
              minwidth={horizontal ? 5 : null}
              justify="center"
              m={horizontal ? '0 1' : null}
              data-place={'right'}
              data-for="mainTooltip"
              data-tip={JSON.stringify({
                type: 'TEXT',
                props: {
                  text: 'Upvote articles that are worth reading, downvote spam.'
                }
              })}
            >
              {postRank || 0}
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
