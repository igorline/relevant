import React, {
  PropTypes
} from 'react';

export default function (props) {
  return (
    <button
      className="shadowButton"
      onClick={() => props.onClick ? props.onClick() : null}
      style={{
        ...props.style
      }}
    >
      <span>{props.children}</span>
    </button>
  );
}
