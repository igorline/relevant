import React, {
  PropTypes
} from 'react';
import { Spinner } from 'react-activity';

if (process.env.BROWSER === true) {
  require('./loading.css');
  require('../../../../node_modules/react-activity/lib/Spinner/Spinner.css');
}

export default function (props) {
  return (
    <div className="loadingContainer">
      <div className="loadingEl"><Spinner color="#858586" size={32} speed={1} /></div>
    </div>
  );
}
