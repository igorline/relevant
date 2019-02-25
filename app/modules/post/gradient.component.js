import React from 'react';
import PropTypes from 'prop-types';
import LinearGradient from 'react-native-linear-gradient';

const bgGradient = [
  'hsla(240, 70%, 30%, .03)',
  'hsla(240, 70%, 20%, .08)',
  'hsla(240, 70%, 10%, .4)',
  'hsla(240, 70%, 8%, .7)',
  'hsla(240, 70%, 5%, .6)'
];

const previewGradient = [
  'hsla(240, 70%, 10%, .4)',
  'hsla(240, 70%, 8%, .7)',
  'hsla(240, 70%, 5%, .6)'
];

export default function Gradient({ title, image, preview }) {
  const textOverlay = preview ? previewGradient : bgGradient;
  const colors = image ? textOverlay : generateColors(title);

  const start = image ? { x: 0.5, y: 0.0 } : { x: 0.8, y: 0.0 };
  const end = image ? { x: 0.5, y: 1.0 } : { x: 0.2, y: 1.0 };

  return <LinearGradient start={start} end={end} colors={colors} style={{ flex: 1 }} />;
}

function generateColors(string) {
  let color = string ? string.length : 0;
  color = (color % 220) + 200 || 200;
  color = Math.max(100, color);
  return [
    `hsla(${parseInt(color - 30, 10)}, 100%, 50%, 1)`,
    `hsla(${parseInt(color, 10)},      100%, 50%, 1)`,
    `hsla(${parseInt(color + 30, 10)}, 100%, 50%, 1)`
  ];
}

Gradient.propTypes = {
  preview: PropTypes.bool,
  image: PropTypes.bool,
  title: PropTypes.string
};
