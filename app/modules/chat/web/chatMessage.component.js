import React, { Component } from 'react';
import { View, Divider, SecondaryText, Spacer, Image } from 'modules/styled/uni';
import PropTypes from 'prop-types';
import AvatarBox from 'modules/user/avatarbox.component';
import Popup from 'modules/ui/web/popup';
import PostButtons from 'modules/post/vote-buttons/postbuttons.container';
import CommentForm from 'modules/comment/web/commentForm.component';
import { layout } from 'app/styles';
import { withRouter } from 'react-router';
import CommentBody from 'modules/comment/web/commentBody.component';
import ButtonRow from 'modules/post/web/buttonRow.component';

class ChatMessage extends Component {
  static propTypes = {
    actions: PropTypes.object,
    comment: PropTypes.object,
    user: PropTypes.object,
    auth: PropTypes.object,
    activeComment: PropTypes.string,
    setActiveComment: PropTypes.func,
    parentPost: PropTypes.object,
    // childComments: PropTypes.object,
    // posts: PropTypes.object,
    nestingLevel: PropTypes.number,
    hidePostButtons: PropTypes.bool,
    hideReplyButtons: PropTypes.bool,
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
    hovering: false,
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

  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.state.editing ||
      nextState.editing ||
      this.state.copied !== nextState.copied ||
      this.state.hovering !== nextState.hovering ||
      this.state.user !== nextState.user
    ) {
      return true;
    }
    return false;
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
      setActiveComment,
      // childComments,
      // posts,
      nestingLevel,
      hidePostButtons,
      hideReplyButtons,
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
    const { editing, copied, hovering, user } = this.state;
    const isActive = activeComment === comment.id;
    let popupOptions;
    if (auth.user && auth.user._id === comment.user) {
      popupOptions = [
        { text: 'Edit Post', action: this.editPost.bind(this) },
        { text: 'Delete Post', action: this.deletePost.bind(this) }
      ];
    } else {
      popupOptions = [
        { text: 'Reply to Post', action: () => setActiveComment(comment.id) }
      ];
    }
    const popup = (
      <Popup options={popupOptions}>
        {hovering && <span className={'optionDots'}>...</span>}
      </Popup>
    );

    const body = (
      <CommentBody
        comment={comment}
        inMainFeed={inMainFeed}
        auth={auth}
        postUrl={postUrl}
        avatarText={avatarText}
        history={history}
        noLink={noLink}
        condensedView={condensedView}
      />
    );

    let inReplyTo;
    if (comment.parentComment && !editing) {
      inReplyTo = <SecondaryText>In reply to @...</SecondaryText>;
    }
    // const commentChildren = get(childComments, comment.id) || [];
    return (
      <View
        ref={this.el}
        onMouseEnter={() => this.setState({ hovering: true })}
        onMouseLeave={() => this.setState({ hovering: false })}
      >
        <Spacer
          nestingLevel={nestingLevel}
          additionalNesting={additionalNesting}
          screenSize={screenSize}
          m={['0 4 0 0', `${preview ? '0 2 0 0' : '0 2 2 2'}`]}
          fdirection="column"
        >
          {nestingLevel > 0 && !hideBorder && (
            <Divider
              className="divider"
              ml={hidePostButtons || screenSize ? 0 : layout.POST_BUTTONS_WIDTH / 3}
            />
          )}
          <View fdirection="row" mt={hideAvatar ? 0 : 1}>
            {!hidePostButtons && !screenSize ? (
              <View w={layout.POST_BUTTONS_WIDTH}>
                <PostButtons {...this.props} post={comment} />
              </View>
            ) : null}
            {screenSize > 0 && nestingLevel > 0 ? (
              <Image
                h={3}
                w={2}
                ml={-3}
                mr={1}
                resizeMode={'contain'}
                source={require('app/public/img/reply.png')}
              />
            ) : null}
            <View fdirection="column" grow={1} shrink={1}>
              {!hideAvatar ? (
                <View fdirection={'row'} justify={'space-between'} zIndex={2}>
                  <AvatarBox
                    twitter={comment.twitter}
                    user={{ ...user, _id: comment.user }}
                    postTime={comment.createdAt}
                    showRelevance={false}
                    condensedView={condensedView}
                    avatarText={avatarText}
                    noLink={noLink}
                  />
                  {popup}
                </View>
              ) : (
                <View style={{ position: 'absolute', right: 0 }} zIndex={2}>
                  {popup}
                </View>
              )}
              {inReplyTo}
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
                    chat
                  />
                </View>
              ) : (
                body
              )}
              {editing || hideReplyButtons || (hidePostButtons && preview) ? null : (
                <View mb={[4, 2]}>
                  <ButtonRow {...this.props} copied={copied} post={comment} />
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
            chat
          />
        )}
        {/* commentChildren.map(childId => (
          <ChatMessage
            {...this.props}
            comment={posts.posts[childId]}
            key={childId}
            nestingLevel={nestingLevel + 1}
          />
        )) */}
      </View>
    );
  }
}
export default withRouter(ChatMessage);
