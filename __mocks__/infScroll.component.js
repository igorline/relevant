import React from 'react';
import PropTypes from 'prop-types';

const InfScroll = props => <div>{props.children}</div>;
InfScroll.propTypes = {
  children: PropTypes.object
};
export default InfScroll;
