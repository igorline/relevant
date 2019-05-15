import React, { Component } from 'react';
import { View, Divider, Spacer, Touchable, Image } from 'modules/styled/uni';
import get from 'lodash.get';
import PropTypes from 'prop-types';
import AvatarBox from 'modules/user/avatarbox.component';
import Popup from 'modules/ui/web/popup';
import PostButtons from 'modules/post/postbuttons.component';
import CommentForm from 'modules/comment/web/commentForm.component';
import CommentBody from 'modules/comment/web/commentBody.component';
import { layout } from 'app/styles';

import ButtonRow from 'modules/post/web/buttonRow.component';
import { withRouter } from 'react-router';

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
    preview: PropTypes.bool,
    inMainFeed: PropTypes.bool,
    history: PropTypes.object,
    screenSize: PropTypes.number,
    additionalNesting: PropTypes.number
  };

  static defaultProps = {
    additionalNesting: 0
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

  cancel = () => {
    this.props.setActiveComment(null);
    this.setState({ editing: false });
  };

  render() {
    const {
      auth,
      comment,
      activeComment,
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
      preview,
      inMainFeed,
      history,
      screenSize,
      additionalNesting
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

    let body = (
      <CommentBody
        comment={comment}
        inMainFeed={inMainFeed}
        auth={auth}
        avatarText={avatarText}
      />
    );

    if (postUrl) {
      body = (
        <Touchable to={postUrl} onClick={() => (noLink ? null : history.push(postUrl))}>
          {body}
        </Touchable>
      );
    }

    const commentChildren = get(childComments, comment.id) || [];
    return (
      <View ref={this.el}>
        <Spacer
          nestingLevel={nestingLevel}
          additionalNesting={additionalNesting}
          screenSize={screenSize}
          m={['0 4 0 0', `${preview ? '0 2 0 0' : '0 2 2 2'}`]}
          fdirection="column"
        >
          {!hideBorder && nestingLevel > 0 && (
            <Divider
              className="divider"
              ml={hidePostButtons || screenSize ? 0 : layout.POST_BUTTONS_WIDTH / 3}
            />
          )}
          <View fdirection="row" mt={4}>
            {!hidePostButtons && !screenSize ? (
              <View w={layout.POST_BUTTONS_WIDTH}>
                <PostButtons {...this.props} post={comment} />
              </View>
            ) : null}
            {nestingLevel > 0 ? (
              <Image
                h={3}
                w={2}
                ml={0}
                mr={1}
                resizeMode={'contain'}
                source={require('app/public/img/reply.png')}
              />
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
                    p={[0, 2]}
                    comment={comment}
                    text={'Update'}
                    cancel={this.cancel}
                    {...this.props}
                    nestingLevel={nestingLevel}
                    additionalNesting={additionalNesting}
                    autoFocus
                  />
                </View>
              ) : (
                body
              )}
              {editing || (hidePostButtons && preview) ? null : (
                <View mb={[4, 2]}>
                  <ButtonRow {...this.props} copied={copied} post={comment} enableTips />
                </View>
              )}
            </View>
          </View>
        </Spacer>

        {isActive && !editing && (
          <CommentForm
            isReply
            nestingLevel={nestingLevel}
            p={[4, 2]}
            text={'Comment'}
            {...this.props}
            additionalNesting={
              additionalNesting +
              (hidePostButtons ? 0 : layout.POST_BUTTONS_NESTING_UNITS)
            }
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
export default withRouter(Comment);
