import React, { Component, PropTypes } from 'react'
import Comments from '../comment/comment.container'

class Comment extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    var comment = this.props.data
    return (
      <div>  
        <h3> <a href={'/profile/' + comment.user._id}>{comment.user.name}:</a> </h3>
        <p>{comment.text}</p>
      </div>
    )
  }
}

export default Comment