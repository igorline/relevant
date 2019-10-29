import React from 'react';
import { ScrollView } from 'react-native';
import { View } from 'modules/styled/uni';
import ToggleContainer from 'modules/profile/settings/toggle.container';

const Settings = () => (
  <ScrollView>
    <View m={2}>
      <ToggleContainer />
    </View>
  </ScrollView>
);

export default Settings;
