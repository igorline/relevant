import React from 'react';
import { useSelector } from 'react-redux';
import AppContainer from 'modules/_app/mobile/app.container';
import { createAppContainer } from 'react-navigation';
import { createDrawerNavigator } from 'react-navigation-drawer';
import SideNav from 'modules/navigation/mobile/sideNav.component';
import { fullWidth } from 'app/styles/global';
import { setTopLevelNavigator, getCurrentRouteAndTab } from 'app/utils/nav';
import { analytics } from 'react-native-firebase';

const Analytics = analytics();

export const MainStack = createDrawerNavigator(
  {
    container: {
      screen: AppContainer,
      path: '',
      navigationOptions: props => {
        const {
          screenProps: { discoverTab }
        } = props;
        const { tab } = getCurrentRouteAndTab();
        const tabName = tab && tab.routeName;
        const isLocked =
          (discoverTab > 0 && tabName === 'discover') || (tab && tab.index > 0) || !tab;
        return {
          header: null,
          drawerLockMode: isLocked ? 'locked-closed' : 'unlocked'
        };
      }
    }
  },
  {
    drawerType: 'slide',
    edgeWidth: fullWidth,
    overlayColor: 'rgba(0, 0, 0, 0.3)',
    minSwipeDistance: 10,
    useNativeAnimations: true,
    contentComponent: SideNav,
    gesturesEnabled: true,
    drawerWidth: () => Math.min(320, fullWidth * 0.9),
    defaultNavigationOptions: () => ({
      gestureResponseDistance: {
        horizontal: fullWidth
      }
    })
  }
);

const MainNavigator = createAppContainer(MainStack);

export default function DrawerRouter() {
  const discoverTab = useSelector(state => state.navigation.discover.tab);
  return (
    <MainNavigator
      screenProps={{ discoverTab }}
      uriPrefix={'https://relevant.community/'}
      ref={navigatorRef => {
        setTopLevelNavigator(navigatorRef);
      }}
      onNavigationStateChange={(prevState, currentState) => {
        const currentScreen = getActiveRouteName(currentState);
        const prevScreen = getActiveRouteName(prevState);

        if (prevScreen !== currentScreen) {
          Analytics.logEvent('screenView', {
            viewName: currentScreen
          });
        }
      }}
    />
  );
}

// gets the current screen from navigation state
function getActiveRouteName(navigationState) {
  if (!navigationState) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];
  // dive into nested navigators
  if (route.routes) {
    return getActiveRouteName(route);
  }
  return route.routeName;
}
