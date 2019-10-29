import React from 'react';
import PropTypes from 'prop-types';
import { colors } from 'styles';
import Svg, { Circle, Text as SVGText } from 'react-native-svg';

PieChart.propTypes = {
  percent: PropTypes.number,
  color: PropTypes.string,
  text: PropTypes.string,
  strokeWidth: PropTypes.number,
  w: PropTypes.string,
  h: PropTypes.string
};

export function PieChart({ percent, color, text, strokeWidth, w, h }) {
  const r = 15.91549430918954;
  const d = 2 * r + strokeWidth;
  // const deg = 3.6 * percent;
  return (
    <Svg height={h || '100%'} width={w || '100%'} viewBox={`0 0 ${d} ${d}`}>
      {/*      <Line
        x1="50%"
        y1="50%"
        x2="50%"
        y2="0"
        style={{ transform: `rotate(${deg}deg)`, transformOrigin: '50% 50%' }}
        stroke={colors.grey}
      /> */}
      <Circle
        cx={'50%'}
        cy={'50%'}
        r={r}
        fill="none"
        strokeWidth={strokeWidth}
        stroke={colors.lightBorder}
      />
      <Circle
        cx={'50%'}
        cy={'50%'}
        r={r}
        fill="none"
        strokeWidth={strokeWidth}
        stroke={color}
        strokeDasharray={`${100 - percent}, ${percent}`}
        strokeDashoffset={25 + 100 - percent}
      />
      {text && (
        <SVGText
          fontSize={'10px'}
          x={'50%'}
          y={'60%'}
          fill={colors.black}
          textAnchor="middle"
          fontFamily="HelveticaNeue-CondensedBold"
        >
          {text}
        </SVGText>
      )}
    </Svg>
  );
}
