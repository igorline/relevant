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
  Platform
} from 'react-native';
import { globalStyles } from '../../styles/global';
import Comment from './comment.component';
import Post from './post.component';
import CommentInput from './commentInput.component';

let styles;
let KBView = KeyboardAvoidingView;
if (Platform.OS === 'android') {
  KBView = View;
}

class SinglePostComments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputHeight: 0,
      editing: false,
      reloading: false,
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
    this.shouldScrollToBottom = this.shouldScrollToBottom.bind(this);
    this.loaded = false;
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

    let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.dataSource = ds.cloneWithRows([]);

    InteractionManager.runAfterInteractions(() => {
      // if (!this.comments) this.loadMoreComments();
      this.loaded = true;
      this.reload();
      if (this.comments) {
        this.dataSource = ds.cloneWithRows(this.comments);
      }

      setTimeout(() => {
        if (this.props.scene.openComment) {
          this.input.textInput.focus();
        }
        return;
      }, 30);


      this.forceUpdate();
    });
  }

  componentDidMount() {
    // if (this.props.scene.openComment) {
    //   this.input.textInput.focus();
    // }
  }

  componentWillReceiveProps(next) {
    // console.log('new comments dif?', next.comments.commentsById[this.id] !== this.props.comments.commentsById[this.id]);
    if (next.comments.commentsById[this.id] !== this.props.comments.commentsById[this.id]) {
      let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

      if (next.comments.commentsById[this.id]) {
        if (next.comments.commentsById[this.id].data) {
          this.dataSource = ds.cloneWithRows(next.comments.commentsById[this.id].data);
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

  toggleEditing(editing, num, animated) {
    if (editing && num !== null) this.scrollToComment(num, animated);
    // if (this.props.singlePostEditing) this.props.singlePostEditing(bool);
    this.setState({ editing });
  }

  scrollToComment(num, animated) {
    this.scrollView.scrollTo({ x: 0, y: num, animated });
  }

  shouldScrollToBottom(type) {
    if (type === 'new') {
      this.scrollOnResize = true;
    }
    this.scrollOnLayout = true;
  }

  scrollToBottom() {
    this.scrollTo = Math.max(this.listviewHeight - this.scrollHeight, 0);
    this.scrollView.scrollTo({ y: this.scrollTo, animated: true });
    this.forceUpdate();
  }

  renderRow(rowData) {
    return (
      <Comment
        {...this.props}
        key={rowData._id}
        parentEditing={this.toggleEditing}
        parentId={this.id}
        comment={rowData}
      />
    );
  }

  reload() {
    this.reloading = true;
    this.props.actions.getComments(this.id, 0, 10);
    this.props.actions.getSelectedPost(this.id);
  }

  renderHeader() {
    let headerEl = [];

    headerEl.push(<Post
      singlePost
      key={0}
      scene={this.props.scene}
      post={this.id}
      {...this.props}
    />);

    if (this.longFormat) {
      if (this.comments && this.total) {
        if (this.total > this.comments.length) {
          headerEl.push(<TouchableHighlight
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
    return headerEl;
  }

  renderComments() {
    // let offset = 0;
    // if (this.props.users.search.length) {
      // offset = 149;
    // }

    if (this.comments) {
      return (<ListView
        enableEmptySections
        removeClippedSubviews={false}
        scrollEventThrottle={16}
        initialListSize={10}
        dataSource={this.dataSource}
        renderRow={this.renderRow}
        keyboardShouldPersistTaps={'always'}
        // keyboardDismissMode={'on-drag'}
        automaticallyAdjustContentInsets={false}
        // contentInset={{ bottom: offset }}
        // onEndReached={!this.longFormat ? this.loadMoreComments : null}
        onEndReachedThreshold={100}
        ref={(scrollView) => {
          this.scrollView = scrollView;
        }}
        onContentSizeChange={(width, height) => {
          this.listviewHeight = height;
          if (this.scrollOnResize) this.scrollToBottom();
          this.scrollOnResize = false;
        }}
        onLayout={(e) => {
          let height = e.nativeEvent.layout.height;
          this.scrollHeight = height;
          if (this.scrollOnLayout) this.scrollToBottom();
          this.scrollOnLayout = false;
        }}
        style={{ flex: 1 }}
        renderHeader={this.renderHeader}
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

  render() {
    return (
      <KBView
        behavior={'padding'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={59 + 24}
      >
        <View style={{ flex: 1 }}>
          {this.renderComments()}
          <CommentInput
            ref={c => this.input = c}
            postId={this.id}
            editing={this.state.editing}
            {...this.props}
            onFocus={this.shouldScrollToBottom}
          />
        </View>
      </KBView>
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

