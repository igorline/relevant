import React from 'react';
import { Animated } from 'react-native';
import { mediumScreenWidth, smallScreenWidth } from 'app/styles/screens';

export function transtionConfig() {
  return {
    timing: Animated.spring,
    useNativeDriver: true,
    speed: 20,
    bounciness: 0,
    overshootClamping: true
  };
}

export const getScreenSize = width => {
  const breakpoints = [mediumScreenWidth, smallScreenWidth];
  let screenSize = 0;
  for (let i = 0; i < breakpoints.length; i++) {
    screenSize = i;
    if (width > breakpoints[i]) return screenSize;
  }
  return screenSize;
};

export const withProps = component => {
  const Comp = component;
  return navProps => <Comp navigation={navProps.navigation} {...navProps.screenProps} />;
};

let _navigator;

export function setTopLevelNavigator(navigatorRef) {
  _navigator = navigatorRef;
}

export function getNavigator() {
  return _navigator;
}

export function dispatchNavigatorAction(action) {
  if (!_navigator) return console.warn('TopLevelNavigator not ready!'); // eslint-disable-line
  return _navigator.dispatch(action);
}

export function getCurrentRouteAndTab() {
  if (!_navigator) return {};
  let route = _navigator.state.nav;
  let tab;
  let tabChildrenCount = 0;
  while (route.routes) {
    route = route.routes[route.index];
    if (tab) tabChildrenCount++;
    if (route.routeName === 'main') {
      tab = route.routes[route.index];
    }
  }
  return { route, tab, tabChildrenCount };
}
