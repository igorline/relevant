import React, { Component } from 'react';
import ProtTypes from 'prop-types';
import { Link } from 'react-router';

class Tag extends Component {
  render() {
    let link = '/discover/tag/' + this.props.name + '/top';
    return (
      <Link to={link} onClick={e => e.stopPropagation()}>
        {'#'}{this.props.name}
      </Link>
    );
  }
}

export default Tag;
