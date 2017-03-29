import React, {
  PropTypes
} from 'react';
// import { Motion, spring, presets } from 'react-motion';

export default function (props) {
  let color = props.color || 'black';
  let backgroundColor = props.backgroundColor || '#EDEDED';
  let boxShadow = '5px 5px 0px ' + color;

  return (
    <button
      className="shadowButton"
      onClick={() => props.onClick()}
      style={{ borderColor: color, backgroundColor, boxShadow, ...props.style }}
    >
      <inner style={{ color }}>{props.children}</inner>
    </button>
  );
}
