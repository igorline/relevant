import React, { Component, PropTypes } from 'react'
import { numbers } from '../../../utils';
import Comments from '../comment/comment.container'
import Divider from '../common/divider.component'
import AvatarBox from '../common/avatarbox.component.js'

if (process.env.BROWSER === true) {
  require('./comment.css');
}

class Comment extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const comment = this.props.data
    const timestamp = numbers.timeSince(Date.parse(comment.createdAt));
    return (
      <div className='comment'>
        <Divider>
          {timestamp}
        </Divider>
        <AvatarBox
          auth={this.props.auth}
          user={{ ...comment.embeddedUser, _id: comment.user }}
        />
        <p className='body'>{comment.text}</p>
      </div>
    )
  }
}

export default Comment
