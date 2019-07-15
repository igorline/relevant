import React from 'react';
import ULink from 'modules/navigation/ULink.component';
import { View, BodyText } from 'modules/styled/uni';
import CommunityList from 'modules/community/communityList.component';

export default () => (
  <View fdirection="column">
    <CommunityList />
    <BodyText inline={1} m={'6 4 12 4'}>
      <ULink external to="mailto:info@relevant.community">
        Get in touch{' '}
      </ULink>
      if you'd like to start your own community
    </BodyText>
  </View>
);
