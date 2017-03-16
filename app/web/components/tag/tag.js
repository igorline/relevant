import React, { Component, PropTypes } from 'react'
import Tags from '../tag/tag.container'

class Tag extends Component {
  constructor(props) {
    super(props)
  }

  render() {
  	return (
  		<div>
        <a href={'/discover/tag/' + this.props.data.name}>{this.props.data.name}</a> 
  		</div>
  	)
  }
}

export default Tag;
