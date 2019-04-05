import React from 'react';
import { View } from 'modules/styled/uni';
import NotificationSettings from 'modules/profile/notificationSettings.component';

import { ScrollView } from 'react-native';

const Notifications = () => (
  <ScrollView>
    <View m={2}>
      <NotificationSettings />
    </View>
  </ScrollView>
);

export default Notifications;
