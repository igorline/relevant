import React, { useState, useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import PropTypes from 'prop-types';

const thumbStyles = {
  position: 'absolute',
  top: 0,
  padding: 10,
  fontSize: 100,
  backgroundColor: 'transparent'
};

Thumb.propTypes = {
  parent: PropTypes.object,
  id: PropTypes.string,
  destroy: PropTypes.func
};

export default function Thumb({ parent, id, destroy }) {
  const [opacity] = useState(new Animated.Value(1));
  const [scale] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        delay: 500,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true
      }),
      Animated.timing(scale, {
        toValue: 1,
        delay: 0,
        duration: 500,
        easing: Easing.elastic(2),
        useNativeDriver: true
      }).start()
    ]).start();

    const timeout = setTimeout(() => destroy(id), 2000);
    return () => {
      clearTimeout(timeout);
      destroy(id);
    };
  }, [destroy, id, opacity, scale]);

  return (
    <Animated.Text
      pointerEvents={'none'}
      key={id}
      style={[
        { ...thumbStyles },
        {
          top: parent.y,
          transform: [{ scale }],
          opacity
        }
      ]}
    >
      👎
    </Animated.Text>
  );
}
