import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Tag from './tag'

class Tags extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    var tags = this.props.post.selectedPost.tags;
    if (tags.length === 0) return null;
  	return (
  		<div>
      Tags: 
        {tags.map(function(tag){
              return (
                <div key={tag._id}>
                <Tag data={tag} />
                </div>
              )
        })}
      </div>
  	)
  }
}

export default Tags;