import React, { Component } from 'react';
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Dimensions,
  InteractionManager,
  ListView,
  RefreshControl,
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as tagActions from '../actions/tag.actions';
import * as postActions from '../actions/post.actions';
import * as userActions from '../actions/user.actions';
import { globalStyles, fullHeight } from '../styles/global';
import Comment from '../components/post/comment.component';
import CustomSpinner from '../components/CustomSpinner.component';
import ErrorComponent from '../components/error.component';
// import UserName from '../components/userNameSmall.component';
// import UserSearchComponent from '../components/createPost/userSearch.component';
// import CommentInput from '../components/commentInput.component';

let styles;

class Comments extends Component {
  constructor(props, context) {
    super(props, context);
    const self = this;
    this.state = {
      comment: null,
      visibleHeight: Dimensions.get('window').height,
      scrollToBottomY: null,
      editing: false,
      reloading: false,
    };
    this.renderHeader = this.renderHeader.bind(this);
    this.scrollToComment = this.scrollToComment.bind(this);
    this.toggleEditing = this.toggleEditing.bind(this);
    this.renderRow = this.renderRow.bind(this);
    this.elHeight = null;
    this.commentRef = {};
    this.scrollToComment = this.scrollToComment.bind(self);
    this.loading = false;
    this.reloading = false;
    this.reload = this.reload.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.longFormat = false;
    this.total = 0;
    this.dataSource = null;
  }

  componentWillMount() {
    this.id = this.props.scene.id;

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
      if (!this.comments) this.loadMore();
    });

    if (this.comments) {
      let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      this.dataSource = ds.cloneWithRows(this.comments);
    }
  }

  componentWillReceiveProps(next) {
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
      this.loadmore = false;
      this.setState({ reloading: false });
    }
  }

  componentDidUpdate(prev) {
    // if (!prev) return;
    // if (prev.comments.comments && prev.comments.comments !== this.props.comments.comments) {
    //   setTimeout(() => {
    //     this.scrollToBottom();
    //   }, 500);
    // }
  }

  scrollToBottom() {
    if (this.props.comments.comments.length < 7) return;
    let scrollDistance = this.state.scrollToBottomY - this.elHeight;
    this.scrollView.scrollTo({ x: 0, y: scrollDistance, animated: true });
    this.setState({});
  }

  toggleEditing(bool, num) {
    if (bool) this.scrollToComment(num);
    this.setState({ editing: bool });
  }

  scrollToComment(num) {
    this.scrollView.scrollTo({ x: 0, y: num, animated: true });
  }

  reload() {
    this.reloading = true;
    this.props.actions.getComments(this.id, 0, 10);
  }

  loadMore() {
    if (this.loadmore) return;
    this.loadmore = true;
    let length = 0;
    if (this.comments && this.comments.length) length = this.comments.length;
    this.props.actions.getComments(this.id, length, 10);
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

  renderHeader() {
    let el = null;

    if (this.longFormat) {
      if (this.comments && this.total) {
        if (this.total > this.comments.length) {
          el = (<TouchableHighlight
            underlayColor={'transparent'}
            onPress={this.loadMore}
            style={styles.loadMoreButton}
          >
            <Text>load earlier...</Text>
          </TouchableHighlight>);
        }
      }
    }
    return el;
  }

  render() {
    let commentsEl = null;
    let loadMoreEl = null;
    let offset = 49;
    if (this.props.users.search.length) {
      offset = 149;
    }

    if (this.dataSource) {
      commentsEl = (<ListView
        enableEmptySections
        removeClippedSubviews={false}
        scrollEventThrottle={16}
        initialListSize={10}
        dataSource={this.dataSource}
        renderRow={this.renderRow}
        keyboardShouldPersistTaps
        keyboardDismissMode={'on-drag'}
        automaticallyAdjustContentInsets={false}
        onEndReached={!this.longFormat ? this.loadMore : null}
        onEndReachedThreshold={100}
        contentInset={{ bottom: offset }}
        ref={(scrollView) => {
          this.scrollView = scrollView;
        }}
        onContentSizeChange={(height) => {
          this.state.scrollToBottomY = height;
        }}
        onLayout={(e) => {
          this.elHeight = e.nativeEvent.layout.height;
        }}
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

    return (
      <KeyboardAvoidingView
        behavior={'padding'}
        style={{ height: fullHeight - 114 }}
        keyboardVerticalOffset={64}
      >
        <View style={styles.commentsContainer}>
          {commentsEl}
          <CommentInput postId={this.id} editing={this.state.editing} {...this.props} />
          {loadMoreEl}
          <CustomSpinner visible={!this.dataSource && !this.props.error.comments} />
          <ErrorComponent parent={'comments'} reloadFunction={this.reload} />
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const localStyles = StyleSheet.create({
  commentsContainer: {
    backgroundColor: 'white',
    position: 'relative',
    flex: 1,
  },
});

styles = { ...localStyles, ...globalStyles };

function mapStateToProps(state) {
  return {
    auth: state.auth,
    comments: state.comments,
    error: state.error,
    users: state.user,
    tags: state.tags,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        ...postActions,
        ...userActions,
        ...tagActions,
      },
      dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Comments);

