import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router';

class Tag extends Component {
  constructor(props) {
    super(props)
  }

  render() {
  	return (
      <Link to={'/discover/tag/' + this.props.name}>
        {'#'}{this.props.name}
      </Link>
  	)
  }
}

export default Tag;
