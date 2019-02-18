import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  RefreshControl,
  TouchableHighlight,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  FlatList,
  Keyboard
} from 'react-native';
import PropTypes from 'prop-types';
import { globalStyles, IphoneX } from 'app/styles/global';
import Comment from 'modules/comment/mobile/comment.component';
import CommentInput from 'modules/comment/mobile/commentInput.component';
import UserSearchComponent from 'modules/createPost/mobile/userSearch.component';
import UrlPreview from 'modules/createPost/mobile/urlPreview.component';
import { View, MobileDivider, Divider } from 'modules/styled/uni';
import PostButtons from 'modules/post/mobile/postButtons.component';
import Post from './post.component';

let styles;

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
    auth: PropTypes.object
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
    this.renderComments = this.renderComments.bind(this);
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
  nesting = {};

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
      }
      this.forceUpdate();
    }, 100);
  }

  getChildren = (id = this.props.postId, nestingLevel = 0) => {
    if (nestingLevel === 0) this.comments = [];
    const { comments, posts } = this.props;
    const children = comments.childComments[id] || [];
    children.forEach(c => {
      this.nesting[c] = nestingLevel;
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

  renderComments() {
    this.getChildren();

    if (this.props.post) {
      return (
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
      );
    }
    return <View style={{ flex: 1 }} />;
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
    let loadEarlier;

    const headerEl = (
      <Post
        singlePost
        key={0}
        navigation={this.props.navigation}
        post={this.props.post}
        link={this.props.link}
        actions={this.props.actions}
        focusInput={() => this.input.textInput.focus()}
      />
    );

    if (this.longFormat) {
      if (this.comments && this.total) {
        if (this.total > this.comments.length) {
          loadEarlier = (
            <TouchableHighlight
              key={1}
              underlayColor={'transparent'}
              onPress={this.loadMoreComments}
              style={styles.loadMoreButton}
            >
              <Text>load earlier...</Text>
            </TouchableHighlight>
          );
        }
      }
    }

    return (
      <View
        onLayout={e => {
          this.headerHeight = e.nativeEvent.layout.height;
        }}
      >
        {headerEl}
        {this.renderRelated()}
        {loadEarlier}
      </View>
    );
  }

  renderRow({ item, index }) {
    const comment = item;
    if (!comment) return null;
    return this.renderComment({ comment, index });
  }

  renderButtons = (comment, index) => {
    const { post, myPostInv, auth, actions, navigation } = this.props;
    return () => (
      <PostButtons
        parentPost={post}
        comment
        post={comment}
        isComment
        actions={actions}
        auth={auth}
        navigation={navigation}
        myPostInv={myPostInv[comment._id]}
        setupReply={() => this.setState({ activeComment: comment, index })}
        focusInput={() => this.input.textInput.focus()}
      />
    );
  };

  renderComment = ({ comment, index }) => {
    const nesting = this.nesting[comment._id];
    const renderButtons = this.renderButtons(comment, index);
    return (
      <View key={comment._id} index={index} fdirection={'column'} flex={1}>
        {nesting ? (
          <View ml={nesting * 3 - 1} mr={2}>
            <Divider />
          </View>
        ) : (
          <MobileDivider />
        )}
        <Comment
          {...this.props}
          parentEditing={this.toggleEditing}
          index={index}
          scrollToComment={() => this.scrollToComment(index)}
          parentId={this.id}
          comment={comment}
          nesting={this.nesting[comment._id]}
          parentView={this.scrollView}
          users={this.props.users}
          renderChildren={this.renderChildren}
          renderButtons={() => renderButtons()}
          nesting={nesting}
        />
      </View>
    );
  };

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
    const { activeComment, index, editing } = this.state;
    return (
      <KeyboardAvoidingView
        behavior={'padding'}
        style={{ flex: 1, backgroundColor: 'white' }}
        keyboardVerticalOffset={
          inputOffset + (Platform.OS === 'android' ? StatusBar.currentHeight : 0)
        }
      >
        {this.renderComments()}
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
            if (typeof index === 'number') this.scrollToComment(index);
            else this.scrollToBottom();
          }}
        />
      </KeyboardAvoidingView>
    );
  }
}

const localStyles = StyleSheet.create({
  postScroll: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start'
  },
  comment: {
    marginLeft: 25,
    marginRight: 4,
    marginBottom: 10
  },
  commentary: {
    marginRight: 4,
    marginLeft: 4,
    marginTop: 3,
    marginBottom: 10
  },
  postContainer: {
    paddingBottom: 25,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0'
  },
  tagsRow: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1
  }
});

styles = { ...localStyles, ...globalStyles };

export default SinglePostComponent;
