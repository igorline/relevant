import React, { Component } from 'react';
import {
  View,
  Divider,
  LinkFont,
  CommentText,
  SecondaryText,
  Spacer
} from 'modules/styled/uni';
import get from 'lodash.get';
import PropTypes from 'prop-types';
import AvatarBox from 'modules/user/avatarbox.component';
import Popup from 'modules/ui/web/popup';
import PostButtons from 'modules/post/postbuttons.component';
import CommentForm from 'modules/comment/web/commentForm.component';
import { colors, sizing } from 'app/styles';
import styled from 'styled-components/primitives';
import ULink from 'modules/navigation/ULink.component';

const PostButtonsContainer = styled.View`
  /* margin-right: ${sizing(4)}; */
  width: ${sizing(12)};
`;

class Comment extends Component {
  static propTypes = {
    actions: PropTypes.object,
    comment: PropTypes.object,
    user: PropTypes.object,
    auth: PropTypes.object,
    activeComment: PropTypes.string,
    setActiveComment: PropTypes.func,
    parentPost: PropTypes.object,
    childComments: PropTypes.object,
    posts: PropTypes.object,
    nestingLevel: PropTypes.number,
    hidePostButtons: PropTypes.bool,
    condensedView: PropTypes.bool,
    postUrl: PropTypes.string,
    hideBorder: PropTypes.bool,
    post: PropTypes.object
  };

  state = {
    editing: false,
    copied: false
  };

  deletePost() {
    // TODO custom confirm
    // eslint-disable-next-line
    const okToDelete = confirm('Are you sure you want to delete this post?');
    if (!okToDelete) return;
    this.props.actions.deleteComment(this.props.comment._id);
  }

  static getDerivedStateFromProps(props) {
    const { user: userState, comment } = props;
    const userId = userState.handleToId[comment.embeddedUser.handle];
    const user = userState.users[userId] || comment.embeddedUser;
    return { user };
  }

  editPost() {
    this.setState({ editing: true });
  }

  // TODO utils
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
  };

  cancel = () => {
    this.props.setActiveComment(null);
    this.setState({ editing: false });
  };

  render() {
    const {
      auth,
      comment,
      activeComment,
      setActiveComment,
      childComments,
      posts,
      nestingLevel,
      hidePostButtons,
      postUrl,
      condensedView,
      hideBorder
    } = this.props;
    if (!comment) return null;
    const { editing, copied, user } = this.state;
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

    const bodyMargin = condensedView ? '-0.5 0 2 5' : '3 0';
    let body = <CommentText m={bodyMargin}>{comment.body}</CommentText>;

    if (postUrl) {
      body = <ULink to={postUrl}>{body}</ULink>;
    }

    const commentChildren = get(childComments, comment.id) || [];

    return (
      <View>
        <Spacer nestingLevel={nestingLevel} m={'4 4 0 0'}>
          {!hidePostButtons ? (
            <PostButtonsContainer>
              <PostButtons {...this.props} post={comment} />
            </PostButtonsContainer>
          ) : null}
          <View fdirection="column" grow={1} shrink={1} zIndex={1}>
            <View fdirection={'row'} justify={'space-between'}>
              <AvatarBox
                twitter={comment.twitter}
                user={{ ...user, _id: comment.user }}
                postTime={comment.createdAt}
                showRelevance
                condensedView={condensedView}
              />
              {popup}
            </View>
            {editing ? (
              <View mt={2}>
                <CommentForm
                  edit
                  comment={comment}
                  text={'Update'}
                  cancel={this.cancel}
                  {...this.props}
                  nestingLevel={null}
                  autoFocus
                />
              </View>
            ) : (
              body
            )}
            {editing ? null : (
              <View
                ml={condensedView ? 5 : 0}
                fdirection="row"
                justify="flex-start"
                aligns="center"
              >
                <ULink
                  to="#"
                  authrequired={true}
                  onClick={e => {
                    e.preventDefault();
                    setActiveComment(comment.id);
                  }}
                  onPress={e => {
                    e.preventDefault();
                    setActiveComment(comment.id);
                  }}
                >
                  <LinkFont mr={3} c={colors.blue}>
                    Reply
                  </LinkFont>
                </ULink>
                <ULink
                  to="#"
                  authrequired={true}
                  onClick={e => {
                    e.preventDefault();
                    this.copyToClipboard();
                  }}
                  onPress={e => {
                    e.preventDefault();
                    this.copyToClipboard();
                  }}
                >
                  <LinkFont mr={3} c={colors.blue}>
                    Share
                  </LinkFont>
                </ULink>
                {copied && <SecondaryText> - Link copied to clipboard</SecondaryText>}
              </View>
            )}
            {!isActive && !hideBorder && <Divider pt={sizing(4)} />}
          </View>
        </Spacer>

        {isActive && !editing && (
          <CommentForm
            isReply
            nestingLevel={nestingLevel}
            additionalNesting={hidePostButtons ? 0 : 1.5}
            p={4}
            mt={4}
            text={'Comment'}
            {...this.props}
            parentComment={comment}
            cancel={this.cancel}
            autoFocus
          />
        )}
        {commentChildren.map(childId => (
          <Comment
            {...this.props}
            comment={posts.posts[childId]}
            key={childId}
            nestingLevel={nestingLevel + 1}
          />
        ))}
      </View>
    );
  }
}
export default Comment;
