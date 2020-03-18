import React, { Component } from 'react';
import {
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  FlatList,
  Keyboard
} from 'react-native';
import PropTypes from 'prop-types';
import { IphoneX } from 'app/styles/global';
import Comment from 'modules/comment/mobile/comment.component';
import CommentInput from 'modules/comment/mobile/commentInput.component';
import UserSearchComponent from 'modules/createPost/mobile/userSearch.component';
import UrlPreview from 'modules/createPost/mobile/urlPreview.component';
import { View, MobileDivider, Divider } from 'modules/styled/uni';
import ButtonContainer from 'modules/post/mobile/postButtons.container';
import Post from './post.component';

const INPUT_OFFSET = IphoneX ? 33 + 55 : 55;

class SinglePostComponent extends Component {
  static propTypes = {
    postId: PropTypes.string,
    postComments: PropTypes.array,
    posts: PropTypes.object,
    post: PropTypes.object,
    error: PropTypes.bool,
    actions: PropTypes.object,
    related: PropTypes.array,
    link: PropTypes.object,
    users: PropTypes.object,
    comments: PropTypes.object,
    navigation: PropTypes.object,
    auth: PropTypes.object,
    admin: PropTypes.object,
    comment: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      inputHeight: 0,
      editing: false,
      reloading: false,
      top: 0,
      suggestionHeight: 0,
      loaded: false,
      gotData: false
    };
    this.id = null;
    this.comments = null;
    this.renderRow = this.renderRow.bind(this);
    this.dataSource = null;
    this.loadMoreComments = this.loadMoreComments.bind(this);
    this.longFormat = false;
    this.total = null;
    this.renderHeader = this.renderHeader.bind(this);
    this.toggleEditing = this.toggleEditing.bind(this);
    this.reload = this.reload.bind(this);
    this.scrollToComment = this.scrollToComment.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.renderUserSuggestions = this.renderUserSuggestions.bind(this);
    this.renderRelated = this.renderRelated.bind(this);
  }

  comments = [];

  nestingLevel = {};

  componentDidMount() {
    const { params } = this.props.navigation.state;
    this.id = this.props.postId;
    this.getChildren(this.id);

    requestAnimationFrame(() => {
      this.setState({ loaded: true });
    });

    if (params.comment) {
      this.setState({ activeComment: params.comment });
    }
  }

  onLoad = () => {
    setTimeout(() => {
      const { params } = this.props.navigation.state;
      if (params.comment && this.comments.length) {
        const id = params.comment._id || params.comment;
        const index = this.comments.findIndex(c => c && id === c._id);
        this.scrollToComment(index);
      }
      if (params && params.openComment) {
        this.input.textInput.focus();
      }
      this.forceUpdate();
    }, 1000);
  };

  getChildren = (id = this.props.postId, nestingLevel = 0) => {
    if (nestingLevel === 0) this.comments = [];
    const { comments, posts } = this.props;
    const children = comments.childComments[id] || [];
    children.forEach(c => {
      this.nestingLevel[c] = nestingLevel;
      this.comments.push(posts.posts[c]);
      this.getChildren(c, nestingLevel + 1);
    });
  };

  componentDidUpdate(prev) {
    const { post } = this.props;
    if (this.comments.length && !this.state.gotData && this.scrollView) {
      this.onLoad();
      this.setState({ gotData: true });
    }

    if (post !== prev.post) {
      clearTimeout(this.stateTimeout);
      this.stateTimeout = setTimeout(() => this.setState({ reloading: false }), 1000);
    }
  }

  loadMoreComments() {
    let length = 0;
    if (this.comments) {
      length = this.comments.length || 0;
    }
    this.props.actions.getComments(this.id, length, 10);
  }

  toggleEditing(editing) {
    this.setState({ editing });
  }

  scrollToComment(index) {
    if (typeof index !== 'number' || index < 0 || !this.scrollView) return;
    this.scrollView.scrollToIndex({ viewPosition: 0.1, index });
    this.setState({ activeComment: this.comments[index], activeIndex: index });
  }

  scrollToTop() {
    if (!this.scrollView) return;
    this.scrollView.scrollToOffset({ offset: 0 });
  }

  scrollToBottom() {
    if (!this.scrollView) return;
    this.scrollTimeout = setTimeout(() => {
      if (!this.scrollView) return;
      if (this.comments && this.comments.length) {
        this.scrollView.scrollToEnd();
      } else if (!this.comments || this.comments.length === 0) {
        const offset = Math.max(0, this.headerHeight - this.scrollHeight);
        this.scrollView.scrollToOffset({ offset });
      }
    }, 60);
  }

  reloadComments() {
    this.props.actions.getComments(this.id, 0, 10);
  }

  reload() {
    this.reloading = true;
    this.props.actions.getComments(this.id, 0, 10);
    this.props.actions.getSelectedPost(this.id);
  }

  renderRelated() {
    const relatedEl = this.props.related.map(r => {
      const post = { _id: r.commentary[0], title: r.title };
      return (
        <View key={r._id} style={{ paddingHorizontal: 15 }}>
          <UrlPreview
            size={'small'}
            urlPreview={r}
            onPress={() => this.props.actions.goToPost(post)}
            domain={r.domain}
            actions={this.props.actions}
          />
        </View>
      );
    });
    return relatedEl;
  }

  renderHeader() {
    const { post, link, actions } = this.props;
    return (
      <View
        onLayout={e => {
          this.headerHeight = e.nativeEvent.layout.height;
        }}
      >
        <Post
          singlePost
          key={0}
          post={post}
          link={link}
          actions={actions}
          focusInput={() => {
            this.setState({ activeComment: post });
            this.input.textInput.focus();
          }}
        />
        {this.renderRelated()}

        {/* link && <TouchableOpacity onPress={this.repostUrl} style={{
          height: 54,
          alignItems: 'center',
          paddingHorizontal: 16,
          flexDirection: 'row'
        }}>
          <Avatar user={auth.user} />
          <Text style={{ color: greyText, marginLeft: 8 }}>Add your comment...</Text>
        </TouchableOpacity>
        */}
      </View>
    );
  }

  renderRow({ item, index }) {
    if (!this.state.loaded) return null;
    const comment = item;
    if (!comment) return null;

    const { post, auth, actions, users } = this.props;

    const setupReply = _comment =>
      this.setState({ activeComment: _comment, activeIndex: index });

    const focusInput = () => this.input.textInput.focus();

    const user = users.users[comment.user] || comment.embeddedUser;
    const nestingLevel = this.nestingLevel[comment._id];

    return (
      <View fdirection={'column'}>
        {nestingLevel ? (
          <View ml={nestingLevel * 3 - 1} mr={2}>
            <Divider />
          </View>
        ) : (
          <MobileDivider />
        )}
        <Comment
          singlePost
          actions={actions}
          auth={auth}
          parentEditing={this.toggleEditing}
          scrollToComment={() => this.scrollToComment(index)}
          comment={comment}
          nestingLevel={nestingLevel}
          user={user}
          renderButtons={() => (
            <View m={'2 0'}>
              <ButtonContainer
                horizontal
                isComment
                parentPost={post}
                post={comment}
                actions={actions}
                auth={auth}
                singlePost
                setupReply={setupReply}
                focusInput={focusInput}
              />
            </View>
          )}
        />
      </View>
    );
  }

  renderUserSuggestions() {
    let parentEl = null;
    if (this.props.users.search) {
      if (this.props.users.search.length) {
        parentEl = (
          <View
            style={{
              position: 'absolute',
              top: this.state.top - this.state.suggestionHeight,
              left: 0,
              right: 0,
              flex: 1,
              maxHeight: this.state.top,
              backgroundColor: 'white',
              borderTopWidth: 1,
              borderTopColor: '#F0F0F0'
            }}
            onLayout={e => {
              this.setState({ suggestionHeight: e.nativeEvent.layout.height });
            }}
          >
            <UserSearchComponent
              style={{ paddingTop: INPUT_OFFSET }}
              setSelected={this.input.setMention}
              users={this.props.users.search}
            />
          </View>
        );
      }
    }
    return parentEl;
  }

  render() {
    const { post } = this.props;
    if (!post) return null;
    const { editing } = this.state;
    let { activeComment } = this.state;

    // TODO this is hacky;
    this.getChildren();

    let commentIndex =
      activeComment && this.comments.findIndex(c => c && c._id === activeComment._id);

    if (activeComment && activeComment._id === post._id) {
      commentIndex = -1;
    } else {
      commentIndex = commentIndex > -1 ? commentIndex : this.comments.length - 1;
      activeComment = this.comments[commentIndex];
    }

    return (
      <KeyboardAvoidingView
        behavior={'padding'}
        style={{ flex: 1, backgroundColor: 'white' }}
        keyboardVerticalOffset={
          INPUT_OFFSET + (Platform.OS === 'android' ? StatusBar.currentHeight : 0)
        }
      >
        <FlatList
          ref={c => (this.scrollView = c)}
          data={this.comments}
          renderItem={this.renderRow}
          keyExtractor={(item, i) => {
            return item ? item._id : 'x' + i;
          }}
          removeClippedSubviews
          pageSize={1}
          initialListSize={4}
          keyboardShouldPersistTaps={'always'}
          keyboardDismissMode={'interactive'}
          onScrollBeginDrag={Keyboard.dismiss}
          onEndReachedThreshold={100}
          overScrollMode={'always'}
          scrollToOverflowEnabled={true}
          style={{ flex: 1 }}
          ListHeaderComponent={this.renderHeader}
          onScrollToIndexFailed={() => {}}
          onLayout={e => {
            this.scrollHeight = e.nativeEvent.layout.height;
          }}
          refreshControl={
            <RefreshControl
              refreshing={this.state.reloading}
              onRefresh={this.reload}
              tintColor="#000000"
              colors={['#000000', '#000000', '#000000']}
              progressBackgroundColor="#ffffff"
            />
          }
        />

        {this.renderUserSuggestions()}

        <CommentInput
          position="fixed"
          parentPost={post}
          parentComment={activeComment}
          ref={c => (this.input = c)}
          postId={this.id}
          placeholder={
            activeComment ? `Reply to @${activeComment.embeddedUser.handle}` : null
          }
          editing={editing}
          {...this.props}
          scrollView={this.scrollView}
          scrollToBottom={this.scrollToBottom}
          updatePosition={params => this.setState(params)}
          onBlur={() => this.setState({ comment: null, index: null })}
          onFocus={() => {
            if (commentIndex > -1) this.scrollToComment(commentIndex);
            else this.scrollToTop();
          }}
        />
      </KeyboardAvoidingView>
    );
  }
}

export default SinglePostComponent;
