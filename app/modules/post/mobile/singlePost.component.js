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
import PostButtons from 'modules/post/mobile/postButtons.component';
import Post from './post.component';

const inputOffset = IphoneX ? 59 + 33 : 59;

class SinglePostComponent extends Component {
  static propTypes = {
    postId: PropTypes.string,
    postComments: PropTypes.array,
    posts: PropTypes.object,
    navigation: PropTypes.object,
    post: PropTypes.object,
    error: PropTypes.bool,
    actions: PropTypes.object,
    related: PropTypes.array,
    link: PropTypes.object,
    users: PropTypes.object,
    comments: PropTypes.object,
    myPostInv: PropTypes.object,
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
      suggestionHeight: 0
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
    this.loaded = false;
    this.renderUserSuggestions = this.renderUserSuggestions.bind(this);
    this.renderRelated = this.renderRelated.bind(this);
  }

  comments = [];
  nestingLevel = {};

  componentWillMount() {
    this.id = this.props.postId;
    this.getChildren(this.id);

    // InteractionManager.runAfterInteractions(() => {
    requestAnimationFrame(() => {
      this.loaded = true;
      this.setState({});
    });

    setTimeout(() => {
      const { params } = this.props.navigation.state;
      if (params && params.openComment) {
        if (params.commentCount && this.comments) {
          this.scrollToBottom(true);
        } else if (!params.commentCount) {
          this.input.textInput.focus();
        }
        if (params.comment) {
          this.setState({ activeComment: params.comment });
        }
      }
      this.forceUpdate();
    }, 100);
  }

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

  componentWillReceiveProps(next) {
    if (next.postComments && next.postComments !== this.props.postComments) {
      if (!this.comments && this.props.navigation.state.openComment) {
        this.scrollToBottom(true);
      }

      this.total = next.postComments.total;
      if (this.total > 10) this.longFormat = true;
    }

    if (this.props.post !== next.post || this.props.error) {
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
    if (typeof index !== 'number') return;
    this.scrollView.scrollToIndex({ viewPosition: 0.1, index });
    const scroll = () => {
      this.scrollView.scrollToIndex({ viewPosition: 0.1, index });
      Keyboard.removeListener('keyboardDidShow', scroll);
    };
    if (Platform.OS === 'android') {
      Keyboard.addListener('keyboardDidShow', scroll);
    }
    this.setState({ activeComment: this.comments[index], activeIndex: index });
  }

  scrollToBottom() {
    this.scrollTimeout = setTimeout(() => {
      if (!this.scrollView) return;
      if (this.comments && this.comments.length) {
        this.scrollView.scrollToEnd();
      } else if (!this.comments || this.comments.length === 0) {
        const offset = Math.max(0, this.headerHeight - this.scrollHeight);
        this.scrollView.scrollToOffset({ offset });
      }
    }, 200);
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
    return (
      <View
        onLayout={e => {
          this.headerHeight = e.nativeEvent.layout.height;
        }}
      >
        <Post
          singlePost
          key={0}
          navigation={this.props.navigation}
          post={this.props.post}
          link={this.props.link}
          actions={this.props.actions}
          focusInput={() => this.input.textInput.focus()}
        />
        {this.renderRelated()}
      </View>
    );
  }

  renderRow({ item, index }) {
    const comment = item;
    if (!comment) return null;

    const { post, myPostInv, auth, actions, navigation, users } = this.props;

    const setupReply = _comment =>
      this.setState({ activeComment: _comment, activeIndex: index });
    const focusInput = () => this.input.textInput.focus();

    const user = users.users[comment.user] || comment.embeddedUser;
    const nestingLevel = this.nestingLevel[comment._id];

    return (
      <View key={comment._id} index={index} fdirection={'column'} flex={1}>
        {nestingLevel ? (
          <View ml={nestingLevel * 3 - 1} mr={2}>
            <Divider screenSize={navigation.screenSize} />
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
            <PostButtons
              isComment
              parentPost={post}
              post={comment}
              actions={actions}
              auth={auth}
              navigation={navigation}
              myPostInv={myPostInv[comment._id]}
              setupReply={setupReply}
              focusInput={focusInput}
            />
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
              style={{ paddingTop: inputOffset }}
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
    const { activeComment, activeIndex, editing } = this.state;

    // TODO this is hacky;
    this.getChildren();

    return (
      <KeyboardAvoidingView
        behavior={'padding'}
        style={{ flex: 1, backgroundColor: 'white' }}
        keyboardVerticalOffset={
          inputOffset + (Platform.OS === 'android' ? StatusBar.currentHeight : 0)
        }
      >
        <FlatList
          ref={c => (this.scrollView = c)}
          data={this.comments}
          renderItem={this.renderRow}
          keyExtractor={(item, index) => index.toString()}
          removeClippedSubviews
          pageSize={1}
          initialListSize={10}
          keyboardShouldPersistTaps={'always'}
          keyboardDismissMode={'interactive'}
          onEndReachedThreshold={100}
          overScrollMode={'always'}
          style={{ flex: 1 }}
          ListHeaderComponent={this.renderHeader}
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
          parentPost={post}
          parentComment={activeComment}
          ref={c => (this.input = c)}
          postId={this.id}
          editing={editing}
          {...this.props}
          scrollView={this.scrollView}
          scrollToBottom={this.scrollToBottom}
          updatePosition={params => this.setState(params)}
          onBlur={() => this.setState({ comment: null, index: null })}
          onFocus={() => {
            if (typeof activeIndex === 'number') this.scrollToComment(activeIndex);
            else this.scrollToBottom();
          }}
        />
      </KeyboardAvoidingView>
    );
  }
}

export default SinglePostComponent;
