import React from 'react';
import PropTypes from 'prop-types';
import LinearGradient from 'react-native-linear-gradient';

export default function Gradient({ title }) {
  let color = title ? title.length : 0;
  color = (color % 220) + 200 || 200;
  color = Math.max(100, color);
  const colors = [
    `hsla(${parseInt(color - 30, 10)}, 100%, 50%, 1)`,
    `hsla(${parseInt(color, 10)},      100%, 50%, 1)`,
    `hsla(${parseInt(color + 30, 10)}, 100%, 50%, 1)`
  ];
  const start = { x: 0.8, y: 0.0 };
  const end = { x: 0.2, y: 1.0 };

  return (
    <LinearGradient
      start={start}
      end={end}
      colors={colors}
      style={{ flex: 1 }}
    >
    </LinearGradient>
  );
}

Gradient.propTypes = {
  title: PropTypes.string,
};
