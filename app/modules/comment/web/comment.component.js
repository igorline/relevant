import React, { Component } from 'react';
import get from 'lodash.get';
import PropTypes from 'prop-types';
import AvatarBox from 'modules/user/avatarbox.component';
import Popup from 'modules/ui/web/popup';
import PostButtons from 'modules/post/web/postbuttons.component';
import { CommentText, SecondaryText } from 'modules/styled/Text.component';
import CommentForm from 'modules/comment/web/commentForm.component';
import { layout, colors } from 'app/styles/globalStyles';
import styled from 'styled-components/primitives';

if (process.env.BROWSER === true) {
  require('./comment.css');
}

const Wrapper = styled.View`
  display: flex;
  flex-direction: row;
  position: relative;
  padding: 2em;
`;

const Actions = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

const View = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  /* flex: 1; */
  /* marginLeft: 10px; */
`;

const Text = styled.Text`
  margin-right:  0.5em;
  color: ${colors.blue};
  /* flex: 1; */
  /* marginLeft: 10px; */
`;

const Touchable = styled.Touchable`
  /* flex: 1; */
  /* marginLeft: 10px; */
`;

const StyledBody = styled(CommentText)`
  margin: 1em 0;
`;

const Container = styled.View`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 1;
  padding-bottom: 2em;
  // ${layout.universalBorder('left')}
  ${layout.universalBorder('bottom')}
`;

class Comment extends Component {
  static propTypes = {
    actions: PropTypes.object,
    comment: PropTypes.object,
    user: PropTypes.object,
    auth: PropTypes.object,
    activeComment: PropTypes.string,
    setActiveComment: PropTypes.func,
    parentPost: PropTypes.string,
    childComments: PropTypes.object,
    posts: PropTypes.object,
  };


  state = {
    editing: false,
    copied: false,
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

  copyToClipboard = () => {
    const el = document.createElement('textarea');
    el.value = window.location;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this.setState({ copied: true });
  }

  render() {
    const {
      auth, comment, activeComment,
      setActiveComment, parentPost, childComments,
      posts,
    } = this.props;
    const { editing, copied } = this.state;
    let popup;
    const isActive = activeComment === comment.id;

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
      <StyledBody>
        {comment.body}
      </StyledBody>
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

    const commentChildren = get(childComments, comment.id) || [];
    // console.log('CHILD COMMENTs', commentChildren);

    return (
      <Wrapper>
        <PostButtons post={comment} {...this.props} />
        <Container>
          <View>
            <AvatarBox
              small
              auth={this.props.auth}
              user={{ ...user, _id: comment.user }}
              postTime={comment.createdAt}
            />
            {popup}
          </View>
          {editing ? edit : body}
          <Actions>
            <Touchable onPress={() => { setActiveComment(comment.id); }}>
              <Text>Reply</Text>
            </Touchable>
            <Touchable onPress={this.copyToClipboard}>
              <Text>Share</Text>
            </Touchable>
            {copied && (<SecondaryText> - Link copied to clipboard</SecondaryText>)}
          </Actions>
          {isActive && (
            <CommentForm isReply text={'Reply'} {...this.props} post={comment} parentPost={parentPost} />
          ) }
          {commentChildren.map(childId => (
            <Comment {...this.props} comment={posts.posts[childId]} key={childId} />
          ))}
        </Container>
      </Wrapper>
    );
  }
}
export default Comment;
