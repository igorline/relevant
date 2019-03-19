import React from 'react';
import { Animated } from 'react-native';
import { layout } from 'app/styles';

let NativeAnimatedModule = null;
if (process.env.WEB !== 'true') {
  // eslint-disable-next-line
  NativeAnimatedModule = require('NativeModules').NativeAnimatedModule;
}

export function transtionConfig() {
  return {
    timing: Animated.spring,
    useNativeDriver: NativeAnimatedModule || false,
    speed: 20,
    bounciness: 0,
    overshootClamping: true
  };
}

export const getScreenSize = width => {
  const breakpoints = [layout.mediumScreenWidth, layout.smallScreenWidth, 0];
  let screenSize = 0;
  for (let i = 0; i < breakpoints.length; i++) {
    if (width <= breakpoints[i]) {
      screenSize = i + 1;
    }
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
