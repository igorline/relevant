import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ULink from 'modules/navigation/ULink.component';

class Tag extends Component {
  static propTypes = {
    name: PropTypes.string,
    community: PropTypes.string,
  };

  render() {
    const { community, name } = this.props;
    const link = `/${community}/top/${name}`;
    return (
      <ULink to={link} onClick={e => e.stopPropagation()}>{'#'}{this.props.name} </ULink>
    );
  }
}

export default Tag;
