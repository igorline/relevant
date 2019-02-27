import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CoinStat from 'modules/stats/coinStat.component';
import {
  View,
  SecondaryText,
  LinkFont,
  Divider,
  BodyText,
  Header
} from 'modules/styled/web';
import { colors, sizing } from 'app/styles';
import styled from 'styled-components';
import ULink from 'modules/navigation/ULink.component';
import { REFERRAL_REWARD, PUBLIC_LINK_REWARD } from 'server/config/globalConstants';
import { copyToClipBoard } from 'utils/text';

const ModalDivider = styled(Divider)`
  position: relative;
  margin: 0 ${sizing(-6)};
`;

const InviteLink = styled(LinkFont)`
  cursor: pointer;
  ${p =>
    p.new
      ? `
    animation-duration: 5s;
    animation-name: slidein;
    @keyframes slidein {
      from {
        color: ${colors.green}
      }

      to {
        color: ${p.c || colors.black}
      }
    }
    `
      : ''}
`;

class InviteModal extends Component {
  componentDidMount() {
    if (!this.props.inviteList.length) {
      const skip = this.props.inviteList.length;
      this.props.actions.getInvites(skip, 100);
    }
  }

  generateInvite = async type => {
    const invite = {
      invitedBy: this.props.auth.user._id
    };
    if (type) {
      invite.type = type;
    }
    return this.props.actions.createInvite(invite);
  };

  render() {
    const { auth, community, count, inviteList, invites } = this.props;
    const { user } = auth;
    // const publicInviteUrl = `/${community.active}/invite/${auth.user.handle}`;
    const publicInviteUrl = `/${community.active}?invitecode=${auth.user.handle}`;
    const origin = window ? window.location.origin : 'https://relevant.community';

    const publicLink = `${origin}${publicInviteUrl}`;

    const invitesEl = inviteList.map(_id => {
      const invite = invites[_id];
      const url = `${origin}/${invite.community}?invitecode=${invite.code}`;
      const now = new Date().getTime();
      const createdAt = Date.parse(invite.createdAt);
      const isNew = now - createdAt < 5000;
      return (
        <View mt={2} fdirection="column" key={_id}>
          <View fdirection="row" justify="space-between">
            <View>
              <InviteLink
                new={isNew}
                onClick={() => copyToClipBoard(url)}
                c={invite.redeemed ? colors.grey : colors.blue}
              >
                {url}
              </InviteLink>
              <LinkFont ml={0.5}>{invite.type === 'admin' ? '(admin)' : ''}</LinkFont>
            </View>
            <LinkFont c={invite.redeemed ? colors.SecondaryText : colors.blue}>
              {invite.redeemed ? 'Redeemed' : 'Available'}
            </LinkFont>
          </View>
          <Divider pt={2} />
        </View>
      );
    });

    return (
      <View display="flex" fdirection="column">
        <View mt={6} display="flex" fdirection="column">
          <SecondaryText>Public Invite Link</SecondaryText>
          <BodyText fdirection="row" align="center" mt={1}>
            Share this public invitation link to earn
            <CoinStat
              ml={0.25}
              mr={0.5}
              size={2}
              spaceBetween={0.25}
              amount={PUBLIC_LINK_REWARD}
              inline={1}
            />
            per invite, perpetually.
          </BodyText>
          <ULink to={'#'} mt={1}>
            <LinkFont onClick={() => copyToClipBoard(publicLink)} c={colors.blue}>
              {publicLink}
            </LinkFont>
          </ULink>
        </View>
        <Divider pt={6} />
        <View display="flex" fdirection="column" mt={6}>
          <SecondaryText>
            Private Invite: {count[community.active]} remaining
          </SecondaryText>
          <BodyText fdirection="row" align="center" mt={1}>
            A private link will earn
            <CoinStat
              ml={0.25}
              mr={0.5}
              size={2}
              spaceBetween={0.25}
              amount={REFERRAL_REWARD}
              inline={1}
            />{' '}
            per invite, and invitees will be given a Reputation boost.
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
        <ModalDivider pt={6} />
        <View mt={6} fdirection={'column'}>
          <Header>Invitations</Header>
          <BodyText fdirection="row" align="center">
            Your invites have earned
            <CoinStat
              ml={0.25}
              size={2}
              spaceBetween={0.25}
              amount={user.referralTokens}
              inline={1}
              mr={0.5}
            />{' '}
            so far
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
  count: PropTypes.object
};

export default InviteModal;
