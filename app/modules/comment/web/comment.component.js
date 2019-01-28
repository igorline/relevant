import React, { Component } from 'react';
import get from 'lodash.get';
import PropTypes from 'prop-types';
import AvatarBox from 'modules/user/avatarbox.component';
import Popup from 'modules/ui/web/popup';
import PostButtons from 'modules/post/web/postbuttons.component';
import { CommentText, SecondaryText } from 'modules/styled';
import CommentForm from 'modules/comment/web/commentForm.component';
import { layout, colors, sizing } from 'app/styles';
import styled from 'styled-components/primitives';

if (process.env.BROWSER === true) {
  require('./comment.css');
}

const Wrapper = styled.View`
  display: flex;
  position: relative;
  flex-direction: column;
`;

const Spacer = styled.View`
  display: flex;
  flex-direction: row;
  position: relative;
  background-color: ${(p) => p.bgColor || 'transparent'}
  padding: ${(p) => sizing.byUnit(p.padding || 0)};
  padding-left: ${(p) => p.nesting ? sizing.byUnit((p.nesting + 1) * 4) : sizing.byUnit(4)};
  flex-grow: 1;
  ${(p) => p.withBorder ? layout.universalBorder() : ''}
`;

const Container = styled.View`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 1;
  padding-bottom: ${sizing.byUnit(2)};
  ${(p) => p.isActive ? '' : layout.universalBorder('bottom')}
`;

const PostButtonsContainer = styled.View`
  margin-right: ${sizing.byUnit(4)};
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
`;

const Text = styled.Text`
  margin-right:  0.5em;
  color: ${colors.blue};
`;

const Touchable = styled.Touchable`
`;

const StyledBody = styled(CommentText)`
  margin: 1em 0;
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
    nesting: PropTypes.number,
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
      posts, nesting,
    } = this.props;
    if (!comment) return null;
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

    const user = this.props.user.users[comment.embeddedUser.handle] || comment.embeddedUser;

    const commentChildren = get(childComments, comment.id) || [];

    return (
      <Wrapper>
        <Spacer nesting={nesting} padding={4}>
          <PostButtonsContainer>
            <PostButtons post={comment} {...this.props} />
          </PostButtonsContainer>
          <Container nesting={nesting} isActive={isActive}>
            <View>
              <AvatarBox
                auth={this.props.auth}
                user={{ ...user, _id: comment.user }}
                postTime={comment.createdAt}
                showRelevance
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
          </Container>
        </Spacer>

        {isActive && (
          <Spacer nesting={nesting + 2 } bgColor={colors.secondaryBG} padding={4} >
            <CommentForm isReply text={'Reply'} {...this.props} post={comment} parentPost={parentPost} />
          </Spacer>
        ) }
        {commentChildren.map(childId => (
          <Comment
            {...this.props}
            comment={posts.posts[childId]}
            key={childId}
            nesting={ nesting + 1}
          />
        ))}
      </Wrapper>
    );
  }
}
export default Comment;
