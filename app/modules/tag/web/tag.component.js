import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

class Tag extends Component {
  static propTypes = {
    name: PropTypes.string,
    community: PropTypes.string,
  };

  render() {
    const { community, name } = this.props;
    const link = `/${community}/top/${name}`;
    return (
      <Link to={link} onClick={e => e.stopPropagation()}>
        {'#'}
        {this.props.name}
      </Link>
    );
  }
}

export default Tag;
