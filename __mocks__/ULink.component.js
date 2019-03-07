import React from 'react';
import PropTypes from 'prop-types';

const { ULinkComponent } = require.requireActual(
  '../app/modules/navigation/ULink.component'
);

const ULink = props => (
  <ULinkComponent {...props} className="ulink-mock" auth={{ isAuthenticated: true }} />
);

ULink.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.node])
};

export default ULink;
