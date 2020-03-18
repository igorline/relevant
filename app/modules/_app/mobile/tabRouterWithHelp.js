import React from 'react';
import { Button, AbsoluteView, Box } from 'modules/styled/uni';
import { IphoneX } from 'app/styles/global';
import { Beacon } from 'react-native-help-scout';
import { TabNavigator, TabContainer } from './tabRouter';

Beacon.init('40ed799c-8c6c-4226-9215-5adfd59e35eb');

const TabContainerWithHelp = props => (
  <Box style={{ flex: 1 }}>
    <TabContainer {...props} />
    <AbsoluteView absolute bottom={IphoneX ? 12 : 8} right={2} styles={{ zIndex: 10 }}>
      <Button onPress={() => Beacon.open()} bradius={2} h={4} minwidth={'0'}>
        Help
      </Button>
    </AbsoluteView>
  </Box>
);

TabContainerWithHelp.router = TabNavigator.router;

export default TabContainerWithHelp;
