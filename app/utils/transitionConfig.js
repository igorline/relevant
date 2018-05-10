import { Animated } from 'react-native';

let NativeAnimatedModule = null;
if (process.env.WEB != 'true') {
  NativeAnimatedModule = require('NativeModules').NativeAnimatedModule;
}

export default function transtionConfig() {
  return {
    timing: Animated.spring,
    useNativeDriver: NativeAnimatedModule || false,
    speed: 20,
    bounciness: 0,
    overshootClamping: true,
  };
}
