import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

class Tag extends Component {
  static propTypes = {
    name: PropTypes.string
  };

  render() {
    const link = '/discover/tag/' + this.props.name + '/top';
    return (
      <Link to={link} onClick={e => e.stopPropagation()}>
        {'#'}
        {this.props.name}
      </Link>
    );
  }
}

export default Tag;
