import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CoinStat from 'modules/stats/coinStat.component';
import {
  View,
  SecondaryText,
  LinkFont,
  Divider,
  BodyText,
  Header,
  CTALink
} from 'modules/styled/uni';
import { colors, sizing } from 'app/styles';
import styled from 'styled-components/primitives';
import ULink from 'modules/navigation/ULink.component';
import { REFERRAL_REWARD, PUBLIC_LINK_REWARD } from 'server/config/globalConstants';
import { copyToClipBoard } from 'utils/text';
import { Animated } from 'react-native';

const ModalDivider = styled(Divider)`
  position: relative;
  margin: 0 -${sizing(6)};
`;

class InviteModal extends Component {
  constructor(props, context) {
    super(props, context);
    this.position = new Animated.Value(0);
    this.color = colors.black;
  }

  componentDidMount() {
    const { auth, inviteList, actions } = this.props;
    const communityInvites = inviteList[auth.community] || [];

    if (!inviteList.length) {
      const skip = communityInvites.length;
      actions.getInvites(skip, 100, auth.community);
    }
  }

  animate = () => {
    this.position.setValue(0);
    this.color = this.position.interpolate({
      inputRange: [0, 1],
      // Green to blue, variables don't work for some reason
      outputRange: ['#7ED321', '#0000ff']
    });
    this.animation = Animated.timing(this.position, {
      toValue: 1,
      duration: 8000
    }).start();
  };

  generateInvite = async type => {
    const invite = {
      invitedBy: this.props.auth.user._id
    };
    if (type) {
      invite.type = type;
    }
    const { postInviteGeneration } = this.props;
    const newInvite = await this.props.actions.createInvite(invite);
    if (postInviteGeneration) {
      postInviteGeneration(newInvite);
    }
  };

  render() {
    const { auth, community, count, inviteList, invites, onShare } = this.props;
    const { user } = auth;
    const publicInviteUrl = `/${auth.community}?invitecode=${auth.user.handle}`;
    const origin =
      window && window.location ? window.location.origin : 'https://relevant.community';

    const publicLink = `${origin}${publicInviteUrl}`;
    const communityInvites = inviteList[auth.community] || [];

    const invitesEl = communityInvites.map(_id => {
      const invite = invites[_id];
      const url = `${origin}/${invite.community}?invitecode=${invite.code}`;
      const now = new Date().getTime();
      const createdAt = Date.parse(invite.createdAt);
      const isNew = now - createdAt < 5000;
      let color = invite.redeemed ? colors.grey : colors.blue;
      if (isNew) {
        this.animate();
        color = this.color || colors.black;
      }
      return (
        <View mt={2} fdirection="column" key={_id}>
          <View fdirection="row" justify="space-between">
            <View fdirection="row" flex={1} mr={1}>
              <CTALink numberOfLines={1} flex={1}>
                <Animated.Text
                  onClick={() => copyToClipBoard(url)}
                  onPress={() =>
                    onShare({
                      title: 'Join Relevant',
                      message: 'Join Relevant',
                      url,
                      subject: 'Join Relevant'
                    })
                  }
                  style={{
                    color
                  }}
                >
                  {url}
                </Animated.Text>
              </CTALink>
              <View ml={0.5} w={6}>
                <CTALink c={colors.grey}>
                  {invite.type === 'admin' ? '(admin)' : null}
                </CTALink>
              </View>
            </View>
            <CTALink c={invite.redeemed ? colors.grey : colors.green}>
              {invite.redeemed ? 'redeemed' : 'available'}
            </CTALink>
          </View>
          <Divider pt={2} />
        </View>
      );
    });

    const url = publicLink;

    return (
      <View display="flex" fdirection="column">
        <View mt={6} display="flex" fdirection="column">
          <SecondaryText>Public Invite Link</SecondaryText>
          <BodyText inline={1} mt={1}>
            You and each new users get{' '}
            <CoinStat size={2} amount={PUBLIC_LINK_REWARD} inline={1} /> coin
            {PUBLIC_LINK_REWARD === 1 ? '' : 's'} per signup via your public invite code.
          </BodyText>
          <LinkFont
            mt={1}
            onClick={() => copyToClipBoard(url)}
            c={colors.blue}
            onPress={() =>
              onShare({
                title: 'Join Relevant',
                message: 'Join Relevant',
                url: publicLink,
                subject: 'Join Relevant'
              })
            }
          >
            {publicLink}
          </LinkFont>
        </View>
        <Divider pt={6} />
        <View display="flex" fdirection="column" mt={6}>
          <SecondaryText>
            Private Invite: Your have {count[community.active]} referral invite
            {count[community.active] > 1 ? 's' : ''} left.
          </SecondaryText>
          <BodyText inline={1} mt={1}>
            Share your Reputation with trustworthy friends with your private invite codes.
            Earn <CoinStat size={2} amount={REFERRAL_REWARD} inline={1} /> coin
            {REFERRAL_REWARD === 1 ? '' : 's'} per signup.
          </BodyText>
        </View>
        <ULink
          to={'#'}
          onPress={() => this.generateInvite()}
          onClick={() => this.generateInvite()}
          c={colors.blue}
        >
          <LinkFont mt={1} c={colors.blue}>
            Click here to generate a new private link
          </LinkFont>
        </ULink>
        {user.role === 'admin' ? (
          <ULink
            to={'#'}
            onPress={() => this.generateInvite('admin')}
            onClick={() => this.generateInvite('admin')}
            c={colors.blue}
          >
            <LinkFont mt={1} c={colors.blue}>
              Click here to generate a new private admin link
            </LinkFont>
          </ULink>
        ) : null}
        <ModalDivider pt={6} />
        <View mt={6} fdirection={'column'}>
          <Header>Private Invites</Header>
          <BodyText inline={1} fdirection="row">
            Here’s how many coins you’ve made from invites so far:{' '}
            <CoinStat size={2} amount={user.referralTokens} inline={1} /> coin
            {user.referralTokens === 1 ? '' : 's'}
          </BodyText>
          <View mt={4} fdirection="column">
            {invitesEl}
          </View>
        </View>
      </View>
    );
  }
}

InviteModal.propTypes = {
  inviteList: PropTypes.array,
  invites: PropTypes.object,
  auth: PropTypes.object,
  community: PropTypes.object,
  actions: PropTypes.object,
  count: PropTypes.object,
  onShare: PropTypes.func,
  postInviteGeneration: PropTypes.func
};

export default InviteModal;
