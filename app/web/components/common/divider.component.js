import React from 'react';

if (process.env.BROWSER === true) {
  require('./divider.css');
}

export default function Divider(props) {
  return (
    <div className="divider">
      <div />
      <div className="ts">{props.children}</div>
      <div />
    </div>
  );
}
