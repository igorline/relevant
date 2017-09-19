import React, { Component, PropTypes } from 'react'
import Comments from '../comment/comment.container'
import AvatarBox from '../common/avatarbox.js'

class Comment extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    var comment = this.props.data
    return (
      <div>
        <AvatarBox user={comment.user} />
        <p>{comment.text}</p>
      </div>
    )
  }
}

export default Comment
