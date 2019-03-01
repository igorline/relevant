import React, { Component } from 'react';
import {
  View,
  Divider,
  CTALink,
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
import Linkify from 'linkifyjs/react';

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
    post: PropTypes.object,
    hideAvatar: PropTypes.bool,
    noLink: PropTypes.bool,
    avatarText: PropTypes.func,
    focusedComment: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    scrollTo: PropTypes.func,
    preview: PropTypes.bool
  };

  state = {
    editing: false,
    copied: false
  };

  constructor(props) {
    super(props);
    this.el = React.createRef();
  }

  scrollIfFocused = () => {
    const { focusedComment, comment, scrollTo } = this.props;
    if (comment && focusedComment === comment._id) {
      this.el.current.measureInWindow((x, y) => {
        scrollTo(0, y);
      });
    }
  };

  componentDidMount() {
    this.scrollIfFocused();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.focusedComment !== this.props.focusedComment) {
      this.scrollIfFocused();
    }
  }

  deletePost() {
    // TODO custom confirm
    // eslint-disable-next-line
    const okToDelete = confirm('Are you sure you want to delete this post?');
    if (!okToDelete) return;
    this.props.actions.deleteComment(this.props.comment._id);
  }

  static getDerivedStateFromProps(props) {
    const { user: userState, comment } = props;
    if (!comment || !comment.embeddedUser) return null;
    const userId = userState.handleToId[comment.embeddedUser.handle];
    const user = userState.users[userId] || comment.embeddedUser;
    return { user };
  }

  editPost() {
    this.setState({ editing: true });
  }

  // TODO utils & link copied via tooltip
  copyToClipboard = () => {
    const { parentPost, auth } = this.props;
    const el = document.createElement('textarea');
    el.value = `${window.location.host}/${auth.community}/post/${parentPost._id}`;
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
      hideBorder,
      hideAvatar,
      noLink,
      avatarText,
      preview
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

    let body = (
      <CommentText style={{ zIndex: 0 }} m={bodyMargin} pl={avatarText ? 5 : 0}>
        <Linkify
          onClick={e => {
            window.open(e.target.text);
          }}
        >
          {comment.body}
        </Linkify>
      </CommentText>
    );

    if (postUrl) {
      body = (
        <ULink to={postUrl} noLink={noLink}>
          {body}
        </ULink>
      );
    }

    const commentChildren = get(childComments, comment.id) || [];

    return (
      <View ref={this.el}>
        <Spacer nestingLevel={nestingLevel} m={'4 4 0 0'}>
          {!hidePostButtons ? (
            <PostButtonsContainer>
              <PostButtons {...this.props} post={comment} />
            </PostButtonsContainer>
          ) : null}
          <View fdirection="column" grow={1} shrink={1}>
            <View fdirection={'row'} justify={'space-between'} zIndex={2}>
              {!hideAvatar && (
                <AvatarBox
                  twitter={comment.twitter}
                  user={{ ...user, _id: comment.user }}
                  postTime={comment.createdAt}
                  showRelevance
                  condensedView={condensedView}
                  avatarText={avatarText}
                  noLink={noLink}
                />
              )}
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
            {editing || (hidePostButtons && preview) ? null : (
              <View
                ml={condensedView ? 5 : 0}
                fdirection="row"
                justify="flex-start"
                aligns="center"
              >
                <ULink
                  hu
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
                  <CTALink mr={3} mb={4} c={colors.blue}>
                    Reply
                  </CTALink>
                </ULink>
                <ULink
                  hu
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
                  <CTALink mr={3} c={colors.blue}>
                    Share
                  </CTALink>
                </ULink>
                {copied && <SecondaryText> - Link copied to clipboard</SecondaryText>}
              </View>
            )}
          </View>
        </Spacer>

        {isActive && !editing && (
          <CommentForm
            isReply
            nestingLevel={nestingLevel}
            additionalNesting={hidePostButtons ? 0 : 1.5}
            p={4}
            // mt={4}
            text={'Comment'}
            {...this.props}
            parentComment={comment}
            cancel={this.cancel}
            autoFocus
          />
        )}
        {!hideBorder && <Divider m={'0 4'} />}
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
