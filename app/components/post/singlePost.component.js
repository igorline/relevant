import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  InteractionManager,
  RefreshControl,
  ListView,
  TouchableHighlight,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  FlatList,
  Keyboard
} from 'react-native';
import { globalStyles, fullHeight } from '../../styles/global';
import Comment from './comment.component';
import Post from './post.component';
import CommentInput from './commentInput.component';
import UserSearchComponent from '../createPost/userSearch.component';

let styles;
// let KBView = KeyboardAvoidingView;
// if (Platform.OS === 'android') {
//   KBView = View;
// }

class SinglePostComments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputHeight: 0,
      editing: false,
      reloading: false,
      top: 0
    };
    this.post = null;
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
    this.updatePosition = this.updatePosition.bind(this);
  }

  componentWillMount() {
    this.id = this.props.post;

    if (this.props.comments.commentsById[this.id]) {
      if (this.props.comments.commentsById[this.id].data) {
        this.comments = this.props.comments.commentsById[this.id].data;
      }
      if (this.props.comments.commentsById[this.id].total) {
        this.total = this.props.comments.commentsById[this.id].total;
        if (this.total > 10) this.longFormat = true;
      }
    }

    InteractionManager.runAfterInteractions(() => {
      this.loaded = true;
      this.reload();

      setTimeout(() => {
        if (this.props.scene.openComment) {
          if (!this.props.post.commentCount) {
            this.scrollToBottom(true);
          } else {
            this.input.textInput.focus();
          }
        }
        return;
      }, 100);

      this.forceUpdate();
    });
  }

  componentWillUnmount() {
  }

  componentWillReceiveProps(next) {
    if (next.comments.commentsById[this.id] !== this.props.comments.commentsById[this.id]) {
      if (next.comments.commentsById[this.id]) {
        if (next.comments.commentsById[this.id].data) {
          this.comments = next.comments.commentsById[this.id].data;
        }

        if (next.comments.commentsById[this.id].total) {
          this.total = next.comments.commentsById[this.id].total;
          if (this.total > 10) this.longFormat = true;
        }
      }

      clearTimeout(this.stateTimeout);
      this.stateTimeout = setTimeout(() =>
        this.setState({ reloading: false }), 1000);
    }
  }

  loadMoreComments() {
    let length = 0;
    if (this.comments && this.comments.length) length = this.comments.length;
    this.props.actions.getComments(this.id, length, 10);
  }

  toggleEditing(editing) {
    this.setState({ editing });
  }

  scrollToComment(index) {
    if (typeof index !== 'number') return;
    this.scrollView.scrollToIndex({ viewPosition: 0.1, index });
    let scroll = () => {
      this.scrollView.scrollToIndex({ viewPosition: 0.1, index });
      Keyboard.removeListener('keyboardDidShow', scroll);
    };
    if (Platform.OS === 'android') {
      Keyboard.addListener('keyboardDidShow', scroll);
    }

    // this.forceUpdate();
    // setTimeout(() => {
    //   this.scrollView.scrollToIndex({
    //     viewPosition: 0.1, index
    //   });
    // }, 80);
  }


  scrollToBottom(init) {
    let l = this.scrollView._listRef._totalCellLength + this.scrollView._listRef._headerLength;
    // console.log(this.scrollView._listRef);
    // console.log(l);
    // console.log(fullHeight);
    this.scrollTimeout = setTimeout(() => {
      if (this.comments.length) {
        if (l < fullHeight - 100 && init) return;
        this.scrollView.scrollToEnd();
      } else if (this.comments.length === 0) {
        let offset = this.headerHeight - this.scrollHeight;
        this.scrollView.scrollToOffset({ offset });
      }
      // else this.scrollToComment(this.comments.length - 1);
    }, 100);
  }

  renderRow({ item, index }) {
    return (
      <Comment
        {...this.props}
        key={item._id}
        parentEditing={this.toggleEditing}
        index={index}
        scrollToComment={() => this.scrollToComment(index)}
        parentId={this.id}
        comment={item}
        parentView={this.scrollView}
      />
    );
  }

  reload() {
    this.reloading = true;
    this.props.actions.getComments(this.id, 0, 10);
    this.props.actions.getSelectedPost(this.id);
  }

  renderHeader() {
    let headerEl;
    let loadEarlier;

    headerEl = (<Post
      singlePost
      key={0}
      scene={this.props.scene}
      post={this.id}
      {...this.props}
    />);

    if (this.longFormat) {
      if (this.comments && this.total) {
        if (this.total > this.comments.length) {
          loadEarlier = (<TouchableHighlight
            key={1}
            underlayColor={'transparent'}
            onPress={this.loadMoreComments}
            style={styles.loadMoreButton}
          >
            <Text>load earlier...</Text>
          </TouchableHighlight>);
        }
      }
    }
    return (
      <View
        onLayout={(e) => {
          this.headerHeight = e.nativeEvent.layout.height;
        }}
      >
        {headerEl}
        {loadEarlier}
      </View>
    );
  }

  renderComments() {
    if (this.comments) {
      return (<FlatList
        ref={c => this.scrollView = c}
        data={this.comments}
        renderItem={this.renderRow}
        keyExtractor={(item, index) => index}
        removeClippedSubviews

        keyboardShouldPersistTaps={'always'}
        keyboardDismissMode={'interactive'}
        onEndReachedThreshold={100}

        overScrollMode={'always'}
        style={{ flex: 1 }}
        ListHeaderComponent={this.renderHeader}

        onLayout={(e) => {
          // console.log('layout', this.scrollOnLayout);
          this.scrollHeight = e.nativeEvent.layout.height;
          // this.scrollHeight = height;
          // if (this.scrollOnLayout) this.scrollToBottom();
          // this.scrollOnLayout = false;
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
      />);
    }
    return <View style={{ flex: 1 }} />;
  }

  updatePosition(params) {
    this.setState(params);
  }

  renderUserSuggestions() {
    let parentEl = null;
    if (this.props.users.search) {
      if (this.props.users.search.length) {
        parentEl = (
          <View
            style={{
              position: 'absolute',
              bottom: Math.min(120, this.state.inputHeight),
              left: 0,
              right: 0,
              maxHeight: this.top,
              backgroundColor: 'white',
              borderTopWidth: 1,
              borderTopColor: '#F0F0F0',
            }}
          >
            <UserSearchComponent
              style={{ paddingTop: 59 }}
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
    return (
      <KeyboardAvoidingView
        behavior={'padding'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={59 + (Platform.OS === 'android' ? StatusBar.currentHeight / 2 : 0)}
      >
        {this.renderComments()}
        {this.renderUserSuggestions()}
        <CommentInput
          ref={c => this.input = c}
          postId={this.id}
          editing={this.state.editing}
          {...this.props}
          scrollView={this.scrollView}
          scrollToBottom={this.scrollToBottom}
          updatePosition={this.updatePosition}
          onFocus={() => {
            this.scrollToBottom();
          }}
        />
      </KeyboardAvoidingView>
    );
  }
}

export default SinglePostComments;

const localStyles = StyleSheet.create({
  postScroll: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
  },
  comment: {
    marginLeft: 25,
    marginRight: 4,
    marginBottom: 10,
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
    borderBottomColor: '#F0F0F0',
  },
  tagsRow: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
});

styles = { ...localStyles, ...globalStyles };

