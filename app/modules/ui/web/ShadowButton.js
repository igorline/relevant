import React from 'react';
import PropTypes from 'prop-types';

export default function ShadowButton(props) {
  return (
    <button
      className="shadowButton"
      onClick={() => (props.onClick ? props.onClick() : null)}
      style={{
        ...props.style
      }}
    >
      <span>{props.children}</span>
    </button>
  );
}

ShadowButton.propTypes = {
  onClick: PropTypes.func,
  style: PropTypes.object,
  children: PropTypes.node
};
