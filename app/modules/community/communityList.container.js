import React, { Component } from 'react';
import ULink from 'modules/navigation/ULink.component';
import { View, BodyText, Header, Divider } from 'modules/styled/uni';
import CommunityList from 'modules/community/communityList.component';

export default class CommunityListContainer extends Component {
  render() {
    return (
      <View fdirection="column">
        <Header m={'0 4'}>Communities on Relevant</Header>
        <CommunityList />
        <Divider m={'4 0'} />
        <Header m={'0 4'}>Start a Community on Relevant</Header>
        <BodyText m={'4 4 12 4'}>
          <ULink external to="mailto:info@relevant.community">
            Get in touch{' '}
          </ULink>
          if you'd like to start a community
        </BodyText>
      </View>
    );
  }
}
