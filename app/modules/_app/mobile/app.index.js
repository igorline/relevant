import React, { Component } from 'react';
import codePush from 'react-native-code-push';
import { Provider } from 'react-redux';
import configureStore from 'app/core/mobile/configureStore';
import AppContainer from 'modules/_app/mobile/app.container';
import { createAppContainer, createDrawerNavigator } from 'react-navigation';
import Analytics from 'react-native-firebase-analytics';
import { setTopLevelNavigator } from 'app/utils/nav';
import SideNav from 'modules/navigation/mobile/sideNav.component';
import { fullWidth } from 'app/styles/global';

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

const store = configureStore();
const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.IMMEDIATE
};

export const MainStack = createDrawerNavigator(
  {
    container: {
      screen: AppContainer,
      path: '',
      navigationOptions: {
        header: null
      }
    }
  },
  {
    drawerType: 'slide',
    edgeWidth: 100,
    // minSwipeDistance: 1,
    contentComponent: SideNav,
    drawerWidth: () => Math.min(320, fullWidth * 0.9),
    defaultNavigationOptions: () => ({
      gesturesEnabled: true,
      gestureResponseDistance: {
        horizontal: fullWidth
      }
    })
  }
);

const MainNavigator = createAppContainer(MainStack);

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <MainNavigator
          uriPrefix={'https://relevant.community/'}
          ref={navigatorRef => {
            setTopLevelNavigator(navigatorRef);
          }}
          nNavigationStateChange={(prevState, currentState) => {
            const currentScreen = getActiveRouteName(currentState);
            const prevScreen = getActiveRouteName(prevState);

            if (prevScreen !== currentScreen) {
              Analytics.logEvent('screenView', {
                viewName: currentScreen
              });
            }
          }}
        />
      </Provider>
    );
  }
}

export default codePush(codePushOptions)(App);
