import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AvatarBox from '../common/avatarbox.component';
import Popup from '../common/popup';
import CommentForm from './commentForm.component';
import PostButtons from '../post/postbuttons.component';

if (process.env.BROWSER === true) {
  require('./comment.css');
}

class Comment extends Component {
  static propTypes = {
    actions: PropTypes.object,
    comment: PropTypes.object,
    user: PropTypes.object,
    auth: PropTypes.object
  };

  state = {
    editing: false
  };

  deletePost() {
    // TODO custom confirm
    // eslint-disable-next-line
    const okToDelete = confirm('Are you sure you want to delete this post?');
    if (!okToDelete) return;
    this.props.actions.deleteComment(this.props.comment._id);
  }

  editPost() {
    this.setState({ editing: true });
  }

  render() {
    const { auth, comment } = this.props;
    const { editing } = this.state;
    let popup;

    if (auth.user && auth.user._id === comment.user) {
      popup = (
        <Popup
          options={[
            { text: 'Edit Post', action: this.editPost.bind(this) },
            { text: 'Delete Post', action: this.deletePost.bind(this) }
          ]}
        >
          <span className={'optionDots'}>...</span>
        </Popup>
      );
    }

    const body = (
      <div className="body">
        <pre>{comment.body}</pre>
      </div>
    );
    const edit = (
      <CommentForm
        edit
        comment={comment}
        text={'Update'}
        cancel={() => this.setState({ editing: false })}
        {...this.props}
      />
    );

    let user = this.props.user.users[comment.user] || comment.user;

    if (user && !user._id) {
      user = comment.embeddedUser;
    }

    return (
      <div className="comment">
        {/*        <Avatar auth={this.props.auth} user={user} />
         */}{' '}
        <div style={{ flex: 1, marginLeft: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <AvatarBox
              small
              // noPic
              auth={this.props.auth}
              user={{ ...user, _id: comment.user }}
              date={comment.createdAt}
            />
            {popup}
          </div>
          {editing ? edit : body}
          <PostButtons post={comment} {...this.props} />
        </div>
      </div>
    );
  }
}

export default Comment;
