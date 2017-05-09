
let NativeAnimatedModule = null;
if (process.env.WEB != 'true') {
  NativeAnimatedModule = require('NativeModules').NativeAnimatedModule;
}

export default function transtionConfig() {
  // const easing = Easing.out(Easing.cubic);
  // const easing = Easing.bezier(0.0, 0, 0.58, 1);
  return {
    // timing: Animated.timing,
    duration: 220,
    useNativeDriver: NativeAnimatedModule || false,
    speed: 25,
  };
}
