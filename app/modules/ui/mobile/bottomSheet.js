import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native';
// import { View } from 'modules/styled/uni';
import PropTypes from 'prop-types';
import {
  PanGestureHandler,
  NativeViewGestureHandler,
  State,
  TapGestureHandler
} from 'react-native-gesture-handler';
import { IphoneX } from 'app/styles/global';

const USE_NATIVE_DRIVER = true;

const windowHeight = Dimensions.get('window').height;

BottomSheet.propTypes = {
  children: PropTypes.node,
  close: PropTypes.func
};

export function BottomSheet({ children, close }) {
  const [height, setHeight] = useState(0);
  const [showBg, setShowBg] = useState(true);

  const SnapPointsFromTop =
    height < windowHeight
      ? [windowHeight - height, windowHeight]
      : [50, windowHeight * 0.4, windowHeight];

  const masterdrawer = useRef();
  const drawer = useRef();

  const scroll = React.createRef();

  const START = SnapPointsFromTop[0];
  const END = SnapPointsFromTop[SnapPointsFromTop.length - 1];
  const [lastSnap, setSnap] = useState(END);

  let lastScrollYValue = 0;
  const [lastScrollY] = useState(new Animated.Value(0));
  const onRegisterLastScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: lastScrollY } } }],
    { useNativeDriver: USE_NATIVE_DRIVER }
  );
  lastScrollY.addListener(({ value }) => {
    lastScrollYValue = value;
  });

  const [dragY] = useState(new Animated.Value(0));

  const onGestureEvent = Animated.event([{ nativeEvent: { translationY: dragY } }], {
    useNativeDriver: USE_NATIVE_DRIVER
  });

  const [reverseLastScrollY] = useState(
    Animated.multiply(new Animated.Value(-1), lastScrollY)
  );

  const [translateYOffset] = useState(new Animated.Value(END));

  const translateY = Animated.add(
    translateYOffset,
    Animated.add(dragY, reverseLastScrollY)
  ).interpolate({
    inputRange: [START, END],
    outputRange: [START, END]
    // extrapolate: 'clamp'
  });

  const onHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      const { velocityY } = nativeEvent;
      let { translationY } = nativeEvent;
      translationY -= lastScrollYValue;
      const dragToss = 0.1;
      const endOffsetY = lastSnap + translationY + dragToss * velocityY;

      let destSnapPoint = SnapPointsFromTop[0];
      SnapPointsFromTop.forEach(snapPoint => {
        const distFromSnap = Math.abs(snapPoint - endOffsetY);
        if (distFromSnap < Math.abs(destSnapPoint - endOffsetY)) {
          destSnapPoint = snapPoint;
        }
      });
      setSnap(destSnapPoint);
      // Sets the offset value to the base value,
      // and resets the base value to zero. The final output of the value is unchanged.
      translateYOffset.extractOffset();
      translateYOffset.setValue(translationY);
      // Merges the offset value into the base value
      // and resets the offset to zero. The final output of the value is unchanged.
      translateYOffset.flattenOffset();
      dragY.setValue(0);
      if (destSnapPoint === END) closeModal(velocityY);
      animateView({ offset: translateYOffset, velocityY, destSnapPoint });
    }
  };

  function closeModal({ velocityY = 0 }) {
    setShowBg(false);
    animateView({
      offset: translateYOffset,
      velocityY,
      destSnapPoint: END,
      callback: close
    });
  }

  useEffect(() => {
    if (height === 0) return;
    setSnap(START);
    animateView({
      offset: translateYOffset,
      velocityY: 0,
      destSnapPoint: START
    });
  }, [height]);

  return (
    <TapGestureHandler
      maxDurationMs={100000}
      ref={masterdrawer}
      maxDeltaY={lastSnap - SnapPointsFromTop[0]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={closeModal}
        style={[
          StyleSheet.absoluteFillObject,
          showBg && { backgroundColor: 'hsla(0,0%,0%,.4)' }
        ]}
        pointerEvents={!showBg && 'box-none'}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              transform: [{ translateY }]
            }
          ]}
        >
          <PanGestureHandler
            ref={drawer}
            simultaneousHandlers={[scroll, masterdrawer]}
            shouldCancelWhenOutside={false}
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View style={{ flex: 1 }}>
              <NativeViewGestureHandler
                ref={scroll}
                waitFor={masterdrawer}
                simultaneousHandlers={drawer}
              >
                <Animated.ScrollView
                  style={[
                    {
                      flex: 1,
                      backgroundColor: 'white',
                      marginBottom: IphoneX ? 33 : 0
                    }
                  ]}
                  bounces={false}
                  onScrollBeginDrag={onRegisterLastScroll}
                  scrollEventThrottle={1}
                >
                  <TouchableWithoutFeedback>
                    <View
                      style={[{ paddingVertical: 48, paddingHorizontal: 32 }]}
                      onLayout={e =>
                        setHeight(e.nativeEvent.layout.height + (IphoneX ? 33 : 0))
                      }
                      flex={1}
                    >
                      {children}
                    </View>
                  </TouchableWithoutFeedback>
                </Animated.ScrollView>
              </NativeViewGestureHandler>
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </TouchableOpacity>
    </TapGestureHandler>
  );
}

function animateView({ offset, velocityY, destSnapPoint, callback }) {
  Animated.spring(offset, {
    velocity: velocityY,
    tension: 86,
    friction: 10,
    toValue: destSnapPoint,
    useNativeDriver: USE_NATIVE_DRIVER
  }).start(({ finished }) => finished && callback && callback());
}
