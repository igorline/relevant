import React, {
  PropTypes
} from 'react';
// import { Motion, spring, presets } from 'react-motion';

if (process.env.BROWSER === true) {
  require('./loading.css');
}

export default function (props) {
  return (
    <div className="loadingContainer">
      <div className="loadingEl"></div>
    </div>
  );
}
