import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { browserAlerts } from 'app/utils/alert';
// import { computePayout } from 'app/utils/post';
import { colors, fonts, sizing } from 'app/styles';
import styled from 'styled-components/primitives';
import CoinStat from 'modules/stats/coinStat.component';

const Wrapper = styled.View`
  display: flex;
`;

const Container = styled.View`
  align-items: center;
`;

const View = styled.View`
  margin: 1em 0;
  /* align-items: center; */
  display: flex;
  flex-direction: row;
`;

const Touchable = styled.Touchable`
`;

const Text = styled.Text`
  display: flex;
  color: ${colors.secondaryText}
  ${fonts.Helvetica}
  font-size: 14px;
  line-height: 14px;
`;

const Image = styled.Image`
  width: 23px;
  height: 20px;
`;

const SmallText = styled.Text`
  font-size: ${sizing(1.25)}
`;


// const RLogoImage = styled.Image`
//   width: 14px;
//   height: 14px;
// `;

const VoteIcon = styled(Image)`
`;


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

    let pendingPayouts = 0;
    if (earnings) {
      earnings.pending.forEach(id => {
        const reward = earnings.entities[id];
        // TODO include actual rewards here based on % share
        if (reward && reward.post === post._id) pendingPayouts += reward.stakedTokens;
      });
    }

    if (post === 'notFound') {
      return null;
    }
    if (!post) return null;

    let vote;
    let votedUp;
    let votedDown;
    // let buttonOpacity = { opacity: 1 };
    let upvoteBtn = '/img/upvote.png';

    if (this.props.myPostInv) {
      vote = myPostInv[post.id] || !this.props.auth.isAuthenticated;
      if (auth.user && auth.user._id === post.user) vote = true;
      if (vote) {
        votedUp = vote.amount > 0;
        votedDown = vote.amount < 0;
        // buttonOpacity = { opacity: 0.5 };
        upvoteBtn = '/img/upvote-shadow.svg';
      }
    }

    // let payout;
    // if (post.data && post.data.paidOut) payout = post.data.payout;
    // payout = computePayout(post.data, community);
    // if (post.data && post.data.parentPost) payout = null;

    return (
      <Wrapper className={className}>
        <Container>
          <Touchable onClick={e => this.vote(e, vote)} to="#">
            <VoteIcon
              alt="Upvote"
              source={{ uri: votedUp ? '/img/upvoteActive.png' : upvoteBtn }}
            />
          </Touchable>
          <View>
            <Text>
              {
                post.data ? Math.round(post.data.relevance) : null
              }
            </Text>
          </View>
          <Touchable onClick={e => this.irrelevant(e, vote)} to="#">
            <VoteIcon
              alt="Downvote"
              source={{ uri: votedDown ? '/img/downvote-blue.svg' : '/img/downvote-gray.svg' }}
            />
          </Touchable>
          { pendingPayouts ?
            <View style={{ display: 'flex', flexDirection: 'column' }}>
              <SmallText>your reward:</SmallText>
              <CoinStat mr={0} size={1.25} inheritfont amount={pendingPayouts} />
            </View> :
            null
          }
        </Container>
      </Wrapper>
    );
  }
}

export default PostButtons;
