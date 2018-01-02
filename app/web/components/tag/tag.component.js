import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router';

class Tag extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    let link = '/discover/tag/' + this.props.name;
    if (this.props.auth && !this.props.auth.user) {
      link = '/';
    }
  	return (
      <Link to={link}>
        {'#'}{this.props.name}
      </Link>
  	)
  }
}

export default Tag;
